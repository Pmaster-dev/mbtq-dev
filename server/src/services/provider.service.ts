export interface ProviderConfig {
  name: string;
  type: 'database' | 'ai' | 'kv' | 'auth';
  envVar: string;
  endpoint?: string;
}

export interface ProviderStatus {
  name: string;
  type: string;
  configured: boolean;
  status: 'online' | 'unconfigured' | 'error';
  message?: string;
}

export class ProviderService {
  private providers: ProviderConfig[] = [
    { name: 'Supabase', type: 'database', envVar: 'SUPABASE_URL', endpoint: 'https://supabase.com' },
    { name: 'OpenAI', type: 'ai', envVar: 'OPENAI_API_KEY', endpoint: 'https://api.openai.com/v1' },
    { name: 'Anthropic', type: 'ai', envVar: 'ANTHROPIC_API_KEY', endpoint: 'https://api.anthropic.com' },
    { name: 'Gemini', type: 'ai', envVar: 'GEMINI_API_KEY', endpoint: 'https://generativelanguage.googleapis.com' },
    { name: 'Deno KV', type: 'kv', envVar: 'DENO_KV_URL' },
    { name: 'DeafAUTH', type: 'auth', envVar: 'DEAFAUTH_SECRET' }
  ];

  public checkProviders(env: Record<string, string | undefined> = process.env): ProviderStatus[] {
    return this.providers.map(p => {
      const value = env[p.envVar];
      if (!value) {
        return {
          name: p.name,
          type: p.type,
          configured: false,
          status: 'unconfigured',
          message: `Missing ${p.envVar} environment variable`
        };
      }
      return {
        name: p.name,
        type: p.type,
        configured: true,
        status: 'online',
        message: `${p.name} configured via ${p.envVar}`
      };
    });
  }

  public getProvider(name: string): ProviderConfig | undefined {
    return this.providers.find(p => p.name.toLowerCase() === name.toLowerCase());
  }
}

export const providerService = new ProviderService();
