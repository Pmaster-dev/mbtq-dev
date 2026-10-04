import { describe, it, expect } from 'vitest';
import { ProviderService } from '../provider.service';

describe('ProviderService', () => {
  it('identifies unconfigured providers when environment variables are missing', () => {
    const service = new ProviderService();
    const mockEnv = {};
    const statuses = service.checkProviders(mockEnv);

    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every(s => !s.configured && s.status === 'unconfigured')).toBe(true);
  });

  it('identifies configured providers when environment variables exist', () => {
    const service = new ProviderService();
    const mockEnv = {
      SUPABASE_URL: 'https://xyz.supabase.co',
      OPENAI_API_KEY: 'sk-mock-key'
    };
    const statuses = service.checkProviders(mockEnv);

    const supabaseStatus = statuses.find(s => s.name === 'Supabase');
    expect(supabaseStatus?.configured).toBe(true);
    expect(supabaseStatus?.status).toBe('online');

    const openaiStatus = statuses.find(s => s.name === 'OpenAI');
    expect(openaiStatus?.configured).toBe(true);

    const anthropicStatus = statuses.find(s => s.name === 'Anthropic');
    expect(anthropicStatus?.configured).toBe(false);
  });

  it('retrieves provider configuration by name', () => {
    const service = new ProviderService();
    const provider = service.getProvider('supabase');
    expect(provider).toBeDefined();
    expect(provider?.envVar).toBe('SUPABASE_URL');
  });
});
