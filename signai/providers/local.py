"""Local offline MediaPipe + Transformer SignAI provider (no cloud required)."""
import os
import logging
import asyncio
import sqlite3
import pickle
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional

import cv2
import numpy as np

from .base import SignAIProvider

logger = logging.getLogger(__name__)

# MediaPipe feature dimensions
_POSE_DIM = 33 * 3        # 99
_HAND_DIM = 21 * 3        # 63  (× 2 hands)
_FACE_SUBSET = 8 * 3      # 24  (key grammar landmarks)
FEATURE_DIM = _POSE_DIM + _HAND_DIM * 2 + _FACE_SUBSET  # 249

_FACE_GRAMMAR_IDX = [61, 84, 17, 314, 405, 320, 375, 308]


class _FeatureExtractor:
    """MediaPipe Holistic feature extraction (lazy-loaded)."""

    def __init__(self) -> None:
        import mediapipe as mp  # type: ignore

        self._holistic = mp.solutions.holistic.Holistic(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def extract(self, frame: np.ndarray) -> Optional[np.ndarray]:
        """Return a (249,) feature vector or None if detection fails."""
        try:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = self._holistic.process(rgb)

            pose = np.zeros((33, 3))
            lh = np.zeros((21, 3))
            rh = np.zeros((21, 3))
            face = np.zeros((468, 3))

            if res.pose_landmarks:
                for i, lm in enumerate(res.pose_landmarks.landmark):
                    pose[i] = [lm.x, lm.y, lm.z]
            if res.left_hand_landmarks:
                for i, lm in enumerate(res.left_hand_landmarks.landmark):
                    lh[i] = [lm.x, lm.y, lm.z]
            if res.right_hand_landmarks:
                for i, lm in enumerate(res.right_hand_landmarks.landmark):
                    rh[i] = [lm.x, lm.y, lm.z]
            if res.face_landmarks:
                for i, lm in enumerate(res.face_landmarks.landmark):
                    face[i] = [lm.x, lm.y, lm.z]

            face_sub = face[_FACE_GRAMMAR_IDX]
            return np.concatenate([pose.flatten(), lh.flatten(), rh.flatten(), face_sub.flatten()])
        except Exception as exc:
            logger.debug("MediaPipe extraction failed: %s", exc)
            return None


class _SignVocabDB:
    """Lightweight SQLite vocab store for the local provider."""

    _COMMON = [
        ("hello", "greeting"), ("goodbye", "greeting"), ("please", "courtesy"),
        ("thank you", "courtesy"), ("sorry", "courtesy"), ("yes", "response"),
        ("no", "response"), ("help", "action"), ("stop", "action"), ("go", "action"),
        ("eat", "action"), ("drink", "action"), ("sleep", "action"), ("work", "action"),
        ("home", "place"), ("school", "place"), ("family", "people"), ("friend", "people"),
        ("love", "emotion"), ("happy", "emotion"), ("sad", "emotion"), ("angry", "emotion"),
    ]

    def __init__(self, db_path: str = "signai_local.db") -> None:
        self._path = db_path
        self._init()

    def _init(self) -> None:
        with sqlite3.connect(self._path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS signs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    word TEXT UNIQUE NOT NULL,
                    category TEXT NOT NULL,
                    frequency INTEGER DEFAULT 1
                )
            """)
            conn.executemany(
                "INSERT OR IGNORE INTO signs (word, category) VALUES (?, ?)",
                self._COMMON,
            )
            conn.commit()

    def vocabulary(self) -> Dict[str, int]:
        with sqlite3.connect(self._path) as conn:
            rows = conn.execute("SELECT word FROM signs ORDER BY frequency DESC").fetchall()
        return {word: idx for idx, (word,) in enumerate(rows)}

    def add_sequence(self, word: str, landmarks: np.ndarray, signer_id: str, quality: float) -> None:
        with sqlite3.connect(self._path) as conn:
            row = conn.execute("SELECT id FROM signs WHERE word = ?", (word,)).fetchone()
            if row:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS training_sequences (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sign_id INTEGER, signer_id TEXT,
                        landmarks BLOB, sequence_length INTEGER,
                        quality_score REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.execute(
                    "INSERT INTO training_sequences (sign_id, signer_id, landmarks, sequence_length, quality_score) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (row[0], signer_id, pickle.dumps(landmarks), len(landmarks), quality),
                )
                conn.commit()


class LocalMediaPipeProvider(SignAIProvider):
    """
    Fully offline provider using MediaPipe Holistic for feature extraction
    and a simple heuristic / pre-trained transformer for sign classification.

    No env vars required — always available as the fallback provider.

    Optional env vars:
        SIGNAI_LOCAL_MODEL_PATH  — path to a custom .pth model file
        SIGNAI_LOCAL_DB_PATH     — SQLite vocab database path
    """

    def __init__(self) -> None:
        self._extractor: Optional[_FeatureExtractor] = None  # lazy
        db_path = os.getenv("SIGNAI_LOCAL_DB_PATH", "signai_local.db")
        self._db = _SignVocabDB(db_path)
        self._vocab = self._db.vocabulary()
        self._idx_to_word = {v: k for k, v in self._vocab.items()}
        self._model = self._load_model()
        logger.info("Local MediaPipe provider initialised (vocab=%d)", len(self._vocab))

    def _get_extractor(self) -> _FeatureExtractor:
        if self._extractor is None:
            self._extractor = _FeatureExtractor()
        return self._extractor

    def _load_model(self):
        try:
            import torch

            model_path = os.getenv("SIGNAI_LOCAL_MODEL_PATH", "models/signlang_transformer.pth")
            if not os.path.exists(model_path):
                return None

            from signai.modules.transformer import SignLanguageTransformer  # type: ignore
            model = SignLanguageTransformer(vocab_size=len(self._vocab) + 1)
            model.load_state_dict(torch.load(model_path, map_location="cpu"))
            model.eval()
            return model
        except Exception as exc:
            logger.warning("Could not load local torch model: %s", exc)
            return None

    @property
    def name(self) -> str:
        return "local"

    @property
    def available(self) -> bool:
        return True  # always available

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

        loop = asyncio.get_event_loop()
        feature_seq = await loop.run_in_executor(None, self._extract_all, frames)

        if not feature_seq:
            return self._empty_result()

        if self._model is not None:
            return await loop.run_in_executor(None, self._infer, feature_seq)

        # No model: return feature presence heuristic
        detected = list(self._vocab.keys())[:3]
        return {
            "detected_signs": detected,
            "confidence_scores": [0.5] * len(detected),
            "fingerspelling": [],
            "final_translation": self._to_sentence(detected),
            "sequence_length": len(frames),
            "note": "No trained model loaded; results are placeholder only.",
        }

    def _extract_all(self, frames: List[np.ndarray]) -> List[np.ndarray]:
        ext = self._get_extractor()
        return [v for f in frames for v in [ext.extract(f)] if v is not None]

    def _infer(self, feature_seq: List[np.ndarray]) -> Dict[str, Any]:
        import torch

        tensor = torch.FloatTensor(feature_seq).unsqueeze(0)
        with torch.no_grad():
            out = self._model(tensor)

        probs = torch.softmax(out["signs"], dim=-1)
        detected, confidences = [], []
        for t in range(probs.shape[1]):
            idx = int(torch.argmax(probs[0, t]).item())
            conf = float(probs[0, t, idx].item())
            word = self._idx_to_word.get(idx, "<unknown>")
            detected.append(word)
            confidences.append(conf)

        deduped = self._deduplicate(detected)
        return {
            "detected_signs": deduped,
            "confidence_scores": confidences[: len(deduped)],
            "fingerspelling": [],
            "final_translation": self._to_sentence(deduped),
            "sequence_length": len(feature_seq),
        }

    def add_training_data(self, label: str, frames: List[np.ndarray],
                          signer_id: str) -> Dict[str, Any]:
        ext = self._get_extractor()
        features = [v for f in frames for v in [ext.extract(f)] if v is not None]
        if not features:
            return {"error": "No landmarks detected"}
        arr = np.array(features)
        quality = float(np.mean(np.abs(arr)))
        self._db.add_sequence(label, arr, signer_id, quality)
        return {"status": "success", "sequence_length": len(features), "quality_score": quality}
