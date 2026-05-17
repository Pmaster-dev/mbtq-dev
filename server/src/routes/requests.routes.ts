import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateApiKey, AuthRequest } from '../middleware/auth';
import { WebhookService } from '../services/webhook.service';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/requests
 * Create a new video request
 */
router.post('/', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, requirements, serviceType, budget, deadline } = req.body;
    const companyId = req.companyId!;

    // Validate required fields
    if (!title || !description || !requirements || !serviceType) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: title, description, requirements, serviceType',
      });
      return;
    }

    // Create the request
    const request = await prisma.request.create({
      data: {
        companyId,
        title,
        description,
        requirements,
        serviceType,
        budget: budget ? parseFloat(budget) : null,
        deadline: deadline ? new Date(deadline) : null,
        status: 'PENDING',
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log status
    await prisma.requestStatusLog.create({
      data: {
        requestId: request.id,
        oldStatus: null,
        newStatus: 'PENDING',
        changedBy: companyId,
        notes: 'Request created',
      },
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    console.error('Error creating request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create request',
    });
  }
});

/**
 * GET /api/requests
 * Get all requests for the authenticated company
 */
router.get('/', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const { status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          bids: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  rating: true,
                  completedProjects: true,
                },
              },
            },
          },
          project: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch requests',
    });
  }
});

/**
 * GET /api/requests/:id
 * Get a specific request by ID
 */
router.get('/:id', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId!;

    const request = await prisma.request.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        bids: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                skills: true,
                rating: true,
                completedProjects: true,
              },
            },
          },
        },
        project: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        statusLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Request not found',
      });
      return;
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch request',
    });
  }
});

/**
 * PATCH /api/requests/:id/status
 * Update request status
 */
router.patch('/:id/status', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const companyId = req.companyId!;

    if (!status) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Status is required',
      });
      return;
    }

    const request = await prisma.request.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!request) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Request not found',
      });
      return;
    }

    const oldStatus = request.status;

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status },
    });

    // Log status change
    await prisma.requestStatusLog.create({
      data: {
        requestId: id,
        oldStatus,
        newStatus: status,
        changedBy: companyId,
        notes,
      },
    });

    // Send webhook notification
    await WebhookService.notifyRequestStatusChange(id, oldStatus, status);

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update request status',
    });
  }
});

/**
 * POST /api/requests/:id/accept-bid
 * Accept a bid for a request
 */
router.post('/:id/accept-bid', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { bidId } = req.body;
    const companyId = req.companyId!;

    if (!bidId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Bid ID is required',
      });
      return;
    }

    const request = await prisma.request.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!request) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Request not found',
      });
      return;
    }

    const bid = await prisma.bid.findFirst({
      where: {
        id: bidId,
        requestId: id,
      },
    });

    if (!bid) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Bid not found',
      });
      return;
    }

    const oldStatus = request.status;

    // Batch all database writes in a transaction for performance and atomicity
    const [_, __, ___, project] = await prisma.$transaction([
      // Update bid status to accepted
      prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      }),
      // Reject other bids
      prisma.bid.updateMany({
        where: {
          requestId: id,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      }),
      // Update request status
      prisma.request.update({
        where: { id },
        data: { status: 'BID_ACCEPTED' },
      }),
      // Create project
      prisma.project.create({
        data: {
          requestId: id,
          creatorId: bid.creatorId,
          status: 'IN_PROGRESS',
        },
      }),
      // Log status change
      prisma.requestStatusLog.create({
        data: {
          requestId: id,
          oldStatus,
          newStatus: 'BID_ACCEPTED',
          changedBy: companyId,
          notes: `Accepted bid from creator ${bid.creatorId}`,
        },
      })
    ]);

    // Send webhook notification
    await WebhookService.notifyRequestStatusChange(id, oldStatus, 'BID_ACCEPTED');

    res.json({
      success: true,
      data: {
        request: await prisma.request.findUnique({ where: { id } }),
        project,
      },
    });
  } catch (error: any) {
    console.error('Error accepting bid:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to accept bid',
    });
  }
});

export default router;
