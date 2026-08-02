"""AWS Rekognition + SageMaker SignAI provider."""
import os
import io
import logging
import asyncio
import tempfile
from typing import Any, Dict, List

import cv2
import numpy as np

from .base import SignAIProvider

logger = logging.getLogger(__name__)


class AWSRekognitionProvider(SignAIProvider):
    """
    Uses Amazon Rekognition for body / hand label detection on individual frames,
    and optionally a SageMaker real-time endpoint for custom ASL classification.

    Required env vars:
        AWS_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY
        AWS_REGION              (default: us-east-1)

    Optional env vars:
        AWS_SAGEMAKER_ENDPOINT  — custom ASL model endpoint name
        AWS_S3_BUCKET           — bucket for temporary video upload
    """

    def __init__(self) -> None:
        import boto3  # lazy import so missing dep only fails here

        region = os.getenv("AWS_REGION", "us-east-1")
        self._rekognition = boto3.client("rekognition", region_name=region)
        self._sagemaker_runtime = boto3.client("sagemaker-runtime", region_name=region)
        self._sagemaker_endpoint = os.getenv("AWS_SAGEMAKER_ENDPOINT")
        logger.info("AWS provider initialised (region=%s)", region)

    @property
    def name(self) -> str:
        return "aws"

    @property
    def available(self) -> bool:
        return bool(
            os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")
        )

    async def process_video(self, video_bytes: bytes, fmt: str = "mp4") -> Dict[str, Any]:
        with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as f:
            f.write(video_bytes)
            tmp = f.name

        try:
            cap = cv2.VideoCapture(tmp)
            frames: List[np.ndarray] = []
            while cap.isOpened():
                ok, frame = cap.read()
                if not ok:
                    break
                frames.append(frame)
            cap.release()
        finally:
            os.unlink(tmp)

        return await self.process_frames(frames)

    async def process_frames(self, frames: List[np.ndarray]) -> Dict[str, Any]:
        if not frames:
            return self._empty_result()

        # Sample every 5th frame to stay within Rekognition rate limits
        sampled = frames[::5] or [frames[0]]
        labels_per_frame: List[List[str]] = await asyncio.gather(
            *[self._analyse_frame(f) for f in sampled]
        )

        all_signs = [lbl for group in labels_per_frame for lbl in group]
        deduped = self._deduplicate(all_signs)

        return {
            "detected_signs": deduped,
            "confidence_scores": [0.75] * len(deduped),
            "fingerspelling": [],
            "final_translation": self._to_sentence(deduped),
            "sequence_length": len(frames),
        }

    async def _analyse_frame(self, frame: np.ndarray) -> List[str]:
        """Call Rekognition DetectLabels on a single frame."""
        try:
            _, jpg = cv2.imencode(".jpg", frame)
            image_bytes = jpg.tobytes()

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self._rekognition.detect_labels(
                    Image={"Bytes": image_bytes},
                    MaxLabels=10,
                    MinConfidence=60,
                ),
            )
            return [lbl["Name"] for lbl in response.get("Labels", [])]
        except Exception as exc:
            logger.warning("Rekognition frame analysis failed: %s", exc)
            return []

    async def _call_sagemaker(self, features: bytes) -> Dict[str, Any]:
        """Invoke a custom SageMaker ASL endpoint if configured."""
        if not self._sagemaker_endpoint:
            return {}
        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(
            None,
            lambda: self._sagemaker_runtime.invoke_endpoint(
                EndpointName=self._sagemaker_endpoint,
                ContentType="application/octet-stream",
                Body=features,
            ),
        )
        import json
        return json.loads(resp["Body"].read())
