import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateApiKey, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/webhooks/register
 * Register or update webhook URL for the authenticated company
 */
router.post('/register', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const { webhookUrl } = req.body;
    const companyId = req.companyId!;

    if (!webhookUrl) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Webhook URL is required',
      });
      return;
    }

    // Validate URL format and prevent SSRF
    try {
      const parsedUrl = new URL(webhookUrl);

      // Restrict protocols
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }

      // Block local and internal hostnames using robust validation to prevent SSRF
      const hostname = parsedUrl.hostname.toLowerCase();
      const cleanIp = hostname.replace(/^\[|\]$/g, '');

      const ipv4Regex = /^(127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.\d+\.\d+\.\d+)$/;
      const ipv6Regex = /^((::1)|(::)|(fc|fd)[0-9a-f]{2}:.*|(fe[89ab][0-9a-f]:.*)|(::ffff:.*))$/i;

      if (
        hostname === 'localhost' ||
        hostname.endsWith('.local') ||
        hostname.endsWith('.internal') ||
        ipv4Regex.test(cleanIp) ||
        ipv6Regex.test(cleanIp)
      ) {
        throw new Error('Forbidden hostname');
      }
    } catch (e: any) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid or forbidden webhook URL',
      });
      return;
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { webhookUrl },
      select: {
        id: true,
        name: true,
        webhookUrl: true,
      },
    });

    res.json({
      success: true,
      message: 'Webhook URL registered successfully',
      data: company,
    });
  } catch (error: any) {
    console.error('Error registering webhook:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register webhook',
    });
  }
});

/**
 * DELETE /api/webhooks/register
 * Remove webhook URL for the authenticated company
 */
router.delete('/register', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;

    await prisma.company.update({
      where: { id: companyId },
      data: { webhookUrl: null },
    });

    res.json({
      success: true,
      message: 'Webhook URL removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing webhook:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove webhook',
    });
  }
});

/**
 * GET /api/webhooks/events
 * Get webhook events for the authenticated company
 */
router.get('/events', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    const [events, total] = await Promise.all([
      prisma.webhookEvent.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.webhookEvent.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch webhook events',
    });
  }
});

/**
 * POST /api/webhooks/test
 * Test webhook delivery
 */
router.post('/test', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { webhookUrl: true },
    });

    if (!company || !company.webhookUrl) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'No webhook URL registered',
      });
      return;
    }

    // Create test webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        companyId,
        event: 'webhook.test',
        payload: {
          message: 'This is a test webhook',
          timestamp: new Date().toISOString(),
        },
        url: company.webhookUrl,
        status: 'PENDING',
        attempts: 0,
      },
    });

    // Try to send the webhook
    const { WebhookService } = await import('../services/webhook.service');
    const success = await WebhookService.sendWebhook(webhookEvent.id);

    const updatedEvent = await prisma.webhookEvent.findUnique({
      where: { id: webhookEvent.id },
    });

    res.json({
      success,
      message: success ? 'Test webhook delivered successfully' : 'Test webhook delivery failed',
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to test webhook',
    });
  }
});

export default router;
