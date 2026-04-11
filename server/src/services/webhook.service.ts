import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { SsrfHttpAgent, SsrfHttpsAgent } from '../utils/ssrfAgent';

const prisma = new PrismaClient();

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

/**
 * Service for managing and delivering webhooks
 */
export class WebhookService {
  /**
   * Create a webhook event in the database
   */
  static async createWebhookEvent(
    companyId: string,
    event: string,
    payload: any,
    url: string
  ) {
    return await prisma.webhookEvent.create({
      data: {
        companyId,
        event,
        payload,
        url,
        status: 'PENDING',
        attempts: 0,
      },
    });
  }

  /**
   * Send webhook to the specified URL
   */
  static async sendWebhook(webhookEventId: string): Promise<boolean> {
    try {
      const webhookEvent = await prisma.webhookEvent.findUnique({
        where: { id: webhookEventId },
      });

      if (!webhookEvent) {
        throw new Error('Webhook event not found');
      }

      const webhookPayload: WebhookPayload = {
        event: webhookEvent.event,
        data: webhookEvent.payload,
        timestamp: webhookEvent.createdAt.toISOString(),
      };

      const response = await axios.post(webhookEvent.url, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': webhookEvent.event,
        },
        timeout: 10000, // 10 second timeout
        maxRedirects: 0, // Security: Prevent SSRF via HTTP redirects
        httpAgent: new SsrfHttpAgent(),
        httpsAgent: new SsrfHttpsAgent(),
      });

      // Update webhook event as successful
      await prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: 'SUCCESS',
          attempts: webhookEvent.attempts + 1,
          lastAttempt: new Date(),
          response: JSON.stringify({
            status: response.status,
            data: response.data,
          }),
        },
      });

      return true;
    } catch (error: any) {
      // Update webhook event as failed
      const webhookEvent = await prisma.webhookEvent.findUnique({
        where: { id: webhookEventId },
      });

      if (webhookEvent) {
        await prisma.webhookEvent.update({
          where: { id: webhookEventId },
          data: {
            status: 'FAILED',
            attempts: webhookEvent.attempts + 1,
            lastAttempt: new Date(),
            response: error.message,
          },
        });
      }

      console.error('Webhook delivery failed:', error.message);
      return false;
    }
  }

  /**
   * Notify company about request status change via webhook
   */
  static async notifyRequestStatusChange(
    requestId: string,
    oldStatus: string | null,
    newStatus: string
  ) {
    try {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          company: true,
          project: {
            include: {
              creator: true,
            },
          },
        },
      });

      if (!request || !request.company.webhookUrl) {
        return;
      }

      const webhookEvent = await this.createWebhookEvent(
        request.companyId,
        'request.status_changed',
        {
          requestId: request.id,
          title: request.title,
          oldStatus,
          newStatus,
          project: request.project
            ? {
                id: request.project.id,
                creatorName: request.project.creator.name,
                deliverableUrl: request.project.deliverableUrl,
              }
            : null,
        },
        request.company.webhookUrl
      );

      // Send webhook asynchronously
      this.sendWebhook(webhookEvent.id).catch((error) => {
        console.error('Failed to send webhook:', error);
      });
    } catch (error) {
      console.error('Error in notifyRequestStatusChange:', error);
    }
  }

  /**
   * Notify company about project completion via webhook
   */
  static async notifyProjectCompleted(projectId: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          request: {
            include: {
              company: true,
            },
          },
          creator: true,
        },
      });

      if (!project || !project.request.company.webhookUrl) {
        return;
      }

      const webhookEvent = await this.createWebhookEvent(
        project.request.companyId,
        'project.completed',
        {
          projectId: project.id,
          requestId: project.requestId,
          requestTitle: project.request.title,
          creatorName: project.creator.name,
          deliverableUrl: project.deliverableUrl,
          completedAt: project.completedAt,
        },
        project.request.company.webhookUrl
      );

      // Send webhook asynchronously
      this.sendWebhook(webhookEvent.id).catch((error) => {
        console.error('Failed to send webhook:', error);
      });
    } catch (error) {
      console.error('Error in notifyProjectCompleted:', error);
    }
  }

  /**
   * Retry failed webhooks
   */
  static async retryFailedWebhooks(maxAttempts: number = 3) {
    const failedWebhooks = await prisma.webhookEvent.findMany({
      where: {
        status: 'FAILED',
        attempts: {
          lt: maxAttempts,
        },
      },
      take: 100,
    });

    for (const webhook of failedWebhooks) {
      await this.sendWebhook(webhook.id);
    }
  }
}
