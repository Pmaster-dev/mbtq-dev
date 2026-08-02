import { Request } from 'express';

export interface ApiKey {
  key: string;
  companyId: string;
}

export interface AuthRequest extends Request {
  companyId?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

export interface CreateRequestBody {
  title: string;
  description: string;
  requirements: Record<string, any>;
  serviceType: string;
  budget?: number;
  deadline?: string;
}

export interface CreateBidBody {
  requestId: string;
  amount: number;
  proposal: string;
  estimatedDays?: number;
}

export interface UpdateProjectStatusBody {
  status: string;
  deliverableUrl?: string;
  notes?: string;
}
