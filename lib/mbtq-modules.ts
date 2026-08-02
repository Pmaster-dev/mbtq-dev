/**
 * MBTQ / Deaf First — Module Registry
 * Version: 2.0.0 | Updated: 2026
 *
 * Neural-network-style architecture: Intent → Identity → Infrastructure
 * API brand: Deaf First API
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type ModulePriority = 'foundational' | 'critical' | 'high' | 'medium' | 'optional';
export type ModuleRole =
  | 'ethics_engine'
  | 'identity_cortex'
  | 'nervous_system'
  | 'interface_layer'
  | 'visual_language'
  | 'muscle_memory'
  | 'api_gateway';

export interface ModuleDefinition {
  name: string;
  description: string;
  role: ModuleRole;
  version: string;
  capabilities: string[];
  dependencies: string[];
  priority: ModulePriority;
  status: 'stable' | 'beta' | 'planned';
}

// ─── Module Registry ─────────────────────────────────────────────────────────

export const MODULES: Record<string, ModuleDefinition> = {

  // ETHICS ENGINE — foundational trust, reputation & DAO integrity
  fibonrose: {
    name: 'FibonRose',
    description: 'Trust/ethics engine, task validation & blockchain anchor',
    role: 'ethics_engine',
    version: '1.0.0',
    capabilities: [
      'Fibonacci-sequence task validation',
      'Trust scoring & reputation tracking',
      'DAO governance logic',
      'Blockchain integrity anchoring',
      'Community badge system',
      'GitHub issue milestone confirmation',
    ],
    dependencies: [],
    priority: 'foundational',
    status: 'stable',
  },

  // IDENTITY CORTEX — Deaf-first authentication & verification
  deafauth: {
    name: 'DeafAUTH',
    description: 'Deaf-first identity, JWT issuance & role-based access control',
    role: 'identity_cortex',
    version: '2.0.0',
    capabilities: [
      'API key authentication (companies)',
      'JWT bearer authentication (creators)',
      'DeafAUTH token issue / verify / refresh',
      'Role-based access gates (requireRole)',
      'Deaf identity claims enforcement (requireDeaf)',
      'Firebase / OAuth / DAO provider routing',
    ],
    dependencies: ['fibonrose'],
    priority: 'critical',
    status: 'stable',
  },

  // NERVOUS SYSTEM — real-time coordination & automation execution
  pinksync: {
    name: 'PinkSync',
    description: 'Real-time WebSocket messaging, content fulfilment & automation executor',
    role: 'nervous_system',
    version: '1.0.0',
    capabilities: [
      'Real-time WebSocket messaging (Socket.IO)',
      'Content request & bidding workflow',
      'Creator project lifecycle management',
      'Webhook event delivery with retry',
      'Cross-platform synchronisation',
      'SSRF-safe outbound webhook agent',
    ],
    dependencies: ['deafauth', 'fibonrose'],
    priority: 'critical',
    status: 'stable',
  },

  // API GATEWAY — Deaf First FastAPI backend
  deafFirstApi: {
    name: 'Deaf First API',
    description: 'Python FastAPI gateway — multi-cloud SignAI, DeafAUTH, FibonRose, PinkSync',
    role: 'api_gateway',
    version: '2.0.0',
    capabilities: [
      'ASL recognition via multi-cloud providers (AWS, Azure, Google, OpenAI, Local)',
      'Provider failover & per-request provider selection',
      'DeafAUTH JWT verification & trust-score gating',
      'DAO voting through FibonRose ethics engine',
      'WebSocket real-time sign translation',
      'Training data ingestion & continuous learning',
      'Offline-capable local MediaPipe fallback',
    ],
    dependencies: ['deafauth', 'fibonrose', 'pinksync', 'signai'],
    priority: 'critical',
    status: 'stable',
  },

  // AI MUSCLE MEMORY — multi-cloud ASL recognition
  signai: {
    name: 'SignAI',
    description: 'ASL recognition & generation AI with multi-cloud provider orchestration',
    role: 'muscle_memory',
    version: '2.0.0',
    capabilities: [
      'Real-time ASL gesture recognition',
      'Fingerspelling detection (A–Z)',
      'Sign language animation generation',
      'Contextual grammar marker analysis',
      'Continuous learning from community training data',
    ],
    dependencies: ['deafauth', 'fibonrose'],
    priority: 'optional',
    status: 'beta',
    // Cloud providers supported (configure via env vars)
    // @ts-ignore — extended metadata
    cloud_providers: {
      aws: {
        service: 'Amazon Rekognition + SageMaker',
        env_required: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
        status: 'supported',
      },
      azure: {
        service: 'Azure Computer Vision + Custom Vision',
        env_required: ['AZURE_VISION_KEY', 'AZURE_VISION_ENDPOINT'],
        status: 'supported',
      },
      google: {
        service: 'Google Cloud Video Intelligence + Vertex AI',
        env_required: ['GOOGLE_APPLICATION_CREDENTIALS'],
        status: 'supported',
      },
      openai: {
        service: 'OpenAI GPT-4o Vision',
        env_required: ['OPENAI_API_KEY'],
        status: 'supported',
      },
      local: {
        service: 'MediaPipe Holistic + Transformer (offline)',
        env_required: [],
        status: 'always_available',
      },
    },
  },

  // VISUAL INTERFACE LAYER — ASL-first UI components
  deafcomponents: {
    name: 'Deaf Web Components',
    description: 'ASL-ready UI component library with Sign Visual System',
    role: 'interface_layer',
    version: '1.0.0',
    capabilities: [
      'Sign Visual System (SignerPanel, ConfidenceCue, ActionLog)',
      'Agent state event bus (StateEventBus)',
      'Visual-first component design',
      'ASL flow optimisation',
      'Audio-bypass UX patterns',
      'Accessible interaction models',
    ],
    dependencies: ['deaffonts', 'deafauth'],
    priority: 'high',
    status: 'stable',
  },

  // TYPOGRAPHY SYSTEM — accessible visual communication
  deaffonts: {
    name: 'Deaf Fonts',
    description: 'Accessible typography & visual language system',
    role: 'visual_language',
    version: '1.0.0',
    capabilities: [
      'High-contrast readable fonts',
      'Visual hierarchy optimisation',
      'Sign language glyph support',
      'Accessibility-first typography',
    ],
    dependencies: [],
    priority: 'medium',
    status: 'stable',
  },
};

// ─── Neural Architecture ──────────────────────────────────────────────────────

export const NEURAL_ARCHITECTURE = {
  // Signal flow hierarchy
  signal_flow: {
    authentication:  'deafauth  → fibonrose → [target_module]',
    messaging:       'pinksync  → deafauth  → fibonrose → delivery',
    ui_rendering:    'deafcomponents + deaffonts → deafauth → display',
    ai_processing:   'signai    → deafauth  → fibonrose → execution',
    api_gateway:     'deafFirstApi → deafauth → fibonrose → [module]',
  },

  // Governance layer
  governance: {
    voting_control:          'fibonrose',
    deployment_permissions:  'deafauth + fibonrose',
    community_validation:    'fibonrose',
    task_completion:         'FibonroseValidator (Fibonacci milestone sequence)',
  },

  // SignAI provider priority (first configured & available wins)
  signai_provider_order: ['aws', 'azure', 'google', 'openai', 'local'] as const,
} as const;

// ─── Initialisation Sequence ──────────────────────────────────────────────────

/** Module init order based on dependency graph */
export const INIT_SEQUENCE = [
  'fibonrose',      // Ethics engine first (no dependencies)
  'deafauth',       // Identity cortex (depends on fibonrose)
  'deaffonts',      // Typography (standalone)
  'pinksync',       // Nervous system (depends on deafauth + fibonrose)
  'deafcomponents', // UI layer (depends on deaffonts + deafauth)
  'signai',         // AI agents (depends on deafauth + fibonrose)
  'deafFirstApi',   // API gateway (depends on all above)
] as const;

export type ModuleKey = typeof INIT_SEQUENCE[number];
