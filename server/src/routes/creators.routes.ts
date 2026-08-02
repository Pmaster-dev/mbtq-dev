import { Router, Response, Request } from 'express';
import { PrismaClient, RequestStatus, ProjectStatus } from '@prisma/client';
import { WebhookService } from '../services/webhook.service';
import { authenticateCreator, AuthRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

// Use shared Prisma client (avoid multiple connections)
// const prisma = new PrismaClient(); // ❌ move to a shared module

// Helper to validate numeric inputs
function parsePositiveNumber(value: any, defaultValue?: number): number | null {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num) || num <= 0) return defaultValue ?? null;
  return num;
}

/**
 * POST /api/creators/bids
 * Creator submits a bid for a request
 */
router.post('/bids', authenticateCreator, async (req: AuthRequest, res: Response) => {
  try {
    const { requestId, amount, proposal, estimatedDays } = req.body;
    const creatorId = req.creator!.id;

    if (!requestId || !amount || !proposal) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: requestId, amount, proposal',
      });
      return;
    }

    const numericAmount = parsePositiveNumber(amount);
    if (!numericAmount) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const numericDays = estimatedDays ? parsePositiveNumber(estimatedDays) : null;

    // Fetch request with minimal fields
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!request) {
      res.status(404).json({ error: 'Not Found', message: 'Request not found' });
      return;
    }

    if (request.status !== RequestStatus.OPEN_FOR_BIDS && request.status !== RequestStatus.PENDING) {
      res.status(400).json({ error: 'Bad Request', message: 'Request is not accepting bids' });
      return;
    }

    // Check if creator already bid on this request
    const existingBid = await prisma.bid.findFirst({
      where: { requestId, creatorId },
    });
    if (existingBid) {
      res.status(409).json({ error: 'Conflict', message: 'You have already placed a bid for this request' });
      return;
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        requestId,
        creatorId,
        amount: numericAmount,
        proposal,
        estimatedDays: numericDays,
        status: 'PENDING',
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, rating: true, completedProjects: true },
        },
      },
    });

    res.status(201).json({ success: true, data: bid });
  } catch (error: any) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create bid' });
  }
});

/**
 * GET /api/creators/requests/available
 * Get available requests for creators (open for bids)
 */
router.get('/requests/available', async (req: Request, res: Response) => {
  try {
    let { serviceType, page = '1', limit = '20' } = req.query;
    let pageNum = parseInt(page as string);
    let limitNum = parseInt(limit as string);

    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 20;
    if (limitNum > 100) limitNum = 100; // safety cap

    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: { in: [RequestStatus.PENDING, RequestStatus.OPEN_FOR_BIDS] },
    };
    if (serviceType) where.serviceType = serviceType;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
          bids: { select: { id: true, creatorId: true, amount: true, createdAt: true } },
        },
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    console.error('Error fetching available requests:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch available requests' });
  }
});

/**
 * POST /api/creators/projects/:id/submit
 * Creator submits completed project
 */
router.post('/projects/:id/submit', authenticateCreator, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliverableUrl, notes } = req.body;
    const creatorId = req.creator!.id;

    if (!deliverableUrl || typeof deliverableUrl !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'Deliverable URL is required' });
      return;
    }

    // Fetch project with ownership check
    const project = await prisma.project.findUnique({
      where: { id },
      include: { request: true, creator: { select: { id: true } } },
    });

    if (!project) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    // Ensure this creator owns the project
    if (project.creatorId !== creatorId) {
      res.status(403).json({ error: 'Forbidden', message: 'You do not own this project' });
      return;
    }

    if (project.status !== ProjectStatus.IN_PROGRESS) {
      res.status(400).json({ error: 'Bad Request', message: 'Project is not in progress' });
      return;
    }

    const oldRequestStatus = project.request.status;

    // Transaction – update project, request status, and log
    const [updatedProject] = await prisma.$transaction([
      prisma.project.update({
        where: { id },
        data: {
          status: ProjectStatus.SUBMITTED,
          deliverableUrl,
          notes,
          completedAt: new Date(),
        },
        include: { request: true, creator: true },
      }),
      prisma.request.update({
        where: { id: project.requestId },
        data: { status: RequestStatus.COMPLETED },
      }),
      prisma.requestStatusLog.create({
        data: {
          requestId: project.requestId,
          oldStatus: oldRequestStatus,
          newStatus: RequestStatus.COMPLETED,
          changedBy: creatorId,
          notes: 'Project submitted by creator',
        },
      }),
    ]);

    // Fire webhooks asynchronously (don't await to avoid blocking response)
    Promise.all([
      WebhookService.notifyProjectCompleted(id),
      WebhookService.notifyRequestStatusChange(project.requestId, oldRequestStatus, RequestStatus.COMPLETED),
    ]).catch(err => console.error('Webhook failed:', err));

    res.json({ success: true, data: updatedProject });
  } catch (error: any) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to submit project' });
  }
});

/**
 * GET /api/creators/match/:requestId
 * Find matching creators using stored function
 */
router.get('/match/:requestId', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: { serviceType: true, requirements: true },
    });

    if (!request) {
      res.status(404).json({ error: 'Not Found', message: 'Request not found' });
      return;
    }

    const requiredSkills = (request.requirements as any)?.skills ?? [];
    if (!Array.isArray(requiredSkills)) {
      res.status(400).json({ error: 'Bad Request', message: 'Request requirements missing skills array' });
      return;
    }

    // Safe raw query (parameterized)
    const matchingCreators = await prisma.$queryRaw`
      SELECT * FROM find_matching_creators(
        ${request.serviceType}::TEXT,
        ${requiredSkills}::TEXT[]
      )
    `;

    res.json({ success: true, data: matchingCreators });
  } catch (error: any) {
    console.error('Error finding matching creators:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to find matching creators' });
  }
});

export default router;
