import express from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabase'; // your existing client

const router = express.Router();

// Helper: Generate HMAC signature
const signPayload = (payload: any, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

// 1. List Webhooks
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('webhooks').select('*');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, count: data.length, webhooks: data });
});

// 2. Get One
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('webhooks').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, webhook: data });
});

// 3. Create Webhook
router.post('/', async (req, res) => {
  const { name, url, events, secret } = req.body;
  const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

  const { data, error } = await supabase
    .from('webhooks')
    .insert({ name, url, events, secret: webhookSecret })
    .select()
    .single();

  if (error) return res.status(400).json({ success: false, error: error.message });

  res.status(201).json({ success: true, message: 'Webhook registered', webhook: data });
});

// 4. Update
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('webhooks')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ success: false, error: error.message });
  res.json({ success: true, message: 'Updated', webhook: data });
});

// 5. Delete
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('webhooks').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ success: false, error: error.message });
  res.json({ success: true, message: 'Webhook deleted' });
});

// 6. Delivery History
router.get('/:id/deliveries', async (req, res) => {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('webhook_id', req.params.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, count: data.length, deliveries: data });
});

// 7. Available Events
router.get('/events/types', (req, res) => {
  const events = [
    "user.created", "user.updated", "employment_plan.created",
    "auth.login", "document.uploaded", "ai.process.completed",
    "accessibility.request", "sync.completed"
  ];
  res.json({ success: true, count: events.length, events });
});

// Manual trigger + real event emitter
router.post('/trigger', async (req, res) => {
  const { event, data } = req.body;
  if (!event) return res.status(400).json({ success: false, error: 'event required' });

  await WebhookService.emitEvent(event, data || {});
  res.json({ success: true, message: `Event ${event} emitted` });
});

export default router;
