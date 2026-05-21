import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WebhookService } from '../services/webhook.service';

const router = Router();
const prisma = new PrismaClient();

// Note: These routes are intended for creator workspace (creators.pinksync.io)
// They don't require authentication as they're internal creator operations

/**
 * POST /api/creators/bids
 * Creator submits a bid for a request
 */
router.post('/bids', async (req, res: Response) => {
  try {
    const { requestId, creatorId, amount, proposal, estimatedDays } = req.body;

    if (!requestId || !creatorId || !amount || !proposal) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: requestId, creatorId, amount, proposal',
      });
      return;
    }

    // Verify request exists and is open for bids
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Request not found',
      });
      return;
    }

    if (request.status !== 'OPEN_FOR_BIDS' && request.status !== 'PENDING') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Request is not accepting bids',
      });
      return;
    }

    // Verify creator exists
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Creator not found',
      });
      return;
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        requestId,
        creatorId,
        amount: parseFloat(amount),
        proposal,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
        status: 'PENDING',
      },
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
    });

    res.status(201).json({
      success: true,
      data: bid,
    });
  } catch (error: any) {
    console.error('Error creating bid:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create bid',
    });
  }
});

/**
 * GET /api/creators/requests/available
 * Get available requests for creators (open for bids)
 */
router.get('/requests/available', async (req, res: Response) => {
  try {
    const { serviceType, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: {
        in: ['PENDING', 'OPEN_FOR_BIDS'],
      },
    };

    if (serviceType) {
      where.serviceType = serviceType;
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          bids: {
            select: {
              id: true,
              creatorId: true,
              amount: true,
              createdAt: true,
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
    console.error('Error fetching available requests:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch available requests',
    });
  }
});

/**
 * POST /api/creators/projects/:id/submit
 * Creator submits completed project
 */
router.post('/projects/:id/submit', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const { deliverableUrl, notes } = req.body;

    if (!deliverableUrl) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Deliverable URL is required',
      });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        request: true,
      },
    });

    if (!project) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Project not found',
      });
      return;
    }

    const oldStatus = project.status;
    const oldRequestStatus = project.request.status;

    // ⚡ Bolt Optimization: Batch database writes in transaction
    // 💡 What: Replaced sequential await calls for updating project, request, and creating a log with a single prisma.$transaction.
    // 🎯 Why: Sequential awaits create O(N) network roundtrips, slowing down the request handler. A transaction guarantees atomicity and minimizes network latency.
    // 📊 Impact: Significantly faster endpoint execution and prevents partial updates if one query fails.
    const [updatedProject, _, __] = await prisma.$transaction([
      // Update project
      prisma.project.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          deliverableUrl,
          notes,
          completedAt: new Date(),
        },
        include: {
          request: true,
          creator: true,
        },
      }),
      // Update request status
      prisma.request.update({
        where: { id: project.requestId },
        data: { status: 'COMPLETED' },
      }),
      // Log status change
      prisma.requestStatusLog.create({
        data: {
          requestId: project.requestId,
          oldStatus: oldRequestStatus,
          newStatus: 'COMPLETED',
          changedBy: project.creatorId,
          notes: 'Project submitted by creator',
        },
      })
    ]);

    // Send webhook notification
    await WebhookService.notifyProjectCompleted(id);
    await WebhookService.notifyRequestStatusChange(
      project.requestId,
      oldRequestStatus,
      'COMPLETED'
    );

    res.json({
      success: true,
      data: updatedProject,
    });
  } catch (error: any) {
    console.error('Error submitting project:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to submit project',
    });
  }
});

/**
 * GET /api/creators/match/:requestId
 * Find matching creators for a request (uses stored function)
 */
router.get('/match/:requestId', async (req, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Request not found',
      });
      return;
    }

    // Extract required skills from requirements
    const requiredSkills = request.requirements as any;
    const skillsArray = requiredSkills.skills || [];

    // Call stored function to find matching creators
    const matchingCreators = await prisma.$queryRaw`
      SELECT * FROM find_matching_creators(
        ${request.serviceType}::TEXT,
        ${skillsArray}::TEXT[]
      )
    `;

    res.json({
      success: true,
      data: matchingCreators,
    });
  } catch (error: any) {
    console.error('Error finding matching creators:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to find matching creators',
    });
  }
});

export default router;
