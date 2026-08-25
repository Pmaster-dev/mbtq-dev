import { useState, memo } from 'react';
import { Code, Database, Rocket, Zap, Shield, Eye, FileText, Layers, GitBranch, Terminal } from 'lucide-react';

interface Config {
  type: string;
  auth: string;
  accessibility: boolean;
  deploy: string;
  theme: string;
  snippetPreset: string;
}

interface MappingNode {
  id: string;
  name: string;
  targetDb: string;
  status: string;
}

interface Magician {
  name: string;
  status: string;
  time: string;
}

interface Output {
  repo: string;
  structure: string[];
  magicians: Magician[];
  endpoints: string[];
}

const appTypes = ['webapp', 'api', 'fullstack'];
const authTypes = ['deafauth', 'oauth', 'custom'];
const deployTypes = ['docker', 'railway', 'fly.io', 'cloudflare'];
const textmateThemes = ['dracula', 'monokai', 'nord', 'one-dark'];
const snippetPresets = [
  { label: 'DeafAUTH Middleware', code: '// TextMate Syntax: TypeScript\nexport const authMiddleware = async (req: Request) => {\n  const token = req.headers.get("x-deafauth-token");\n  return await verifyDeafAuth(token);\n};' },
  { label: 'Fibonrose Validator Flow', code: '// TextMate Syntax: TypeScript\nexport const validateTask = (checkpoint: number, evidence: string) => {\n  return fibonrose.confirm({ checkpoint, evidence });\n};' },
  { label: 'Supabase Realtime Sync', code: '// TextMate Syntax: TypeScript\nconst channel = supabase.channel("pinksync")\n  .on("postgres_changes", { event: "*", schema: "public" }, handleSync)\n  .subscribe();' }
];

const MBTQDevGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'generator' | 'mapping'>('generator');
  const [config, setConfig] = useState<Config>({
    type: 'fullstack',
    auth: 'deafauth',
    accessibility: true,
    deploy: 'docker',
    theme: 'dracula',
    snippetPreset: 'DeafAUTH Middleware'
  });
  const [mappingNodes, setMappingNodes] = useState<MappingNode[]>([
    { id: '1', name: 'User Identity Flow', targetDb: 'supabase_auth.users', status: 'mapped' },
    { id: '2', name: 'Fibonrose Validation Log', targetDb: 'dev_db.fibonrose_events', status: 'mapped' },
    { id: '3', name: 'PinkSync Realtime Buffer', targetDb: 'dev_db.pinksync_states', status: 'active' }
  ]);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);

  const generateApp = async () => {
    setGenerating(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setOutput({
      repo: `mbtq-${Date.now()}`,
      structure: [
        '/apps/frontend - Next.js 15',
        '/apps/backend - Express.js',
        '/packages/deafauth - Identity',
        '/packages/fibonrose - Trust',
        '/packages/ui - Components',
        'docker-compose.yml',
        'package.json - Monorepo'
      ],
      magicians: [
        { name: 'UI Magician', status: 'complete', time: '1.2s' },
        { name: 'API Magician', status: 'complete', time: '0.8s' },
        { name: 'Data Magician', status: 'complete', time: '1.5s' },
        { name: 'A11y Magician', status: 'complete', time: '0.6s' },
        { name: 'Deploy Magician', status: 'ready', time: '-' }
      ],
      endpoints: [
        'POST /api/auth/deafauth',
        'GET /api/fibonrose/trust',
        'POST /api/pinksync/deploy'
      ]
    });

    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-10 h-10 text-pink-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                MBTQ.dev
              </h1>
            </div>
            <p className="text-slate-400">AI-Powered Full Stack Generator • Flow & DB Interface Builder</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              Stack Generator
            </button>
            <button
              onClick={() => setActiveTab('mapping')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'mapping'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              MappingPane (DB & Flow)
            </button>
          </div>
        </div>

        {activeTab === 'generator' ? (
        /* Main Generator */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            
            {/* Prompt Input */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
              <div className="flex justify-between items-end mb-3">
                <label htmlFor="app-description" className="block text-sm font-medium text-slate-300">
                  Describe Your App <span className="text-pink-500" aria-hidden="true">*</span>
                  <span className="sr-only"> (Required)</span>
                </label>
                <div className="flex items-center gap-3">
                  {prompt.length > 0 && (
                    <button
                      onClick={() => setPrompt('')}
                      className="text-xs text-pink-400 hover:text-pink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded px-1 transition-colors"
                      aria-label="Clear description"
                    >
                      Clear
                    </button>
                  )}
                  <span className="text-xs text-slate-500" aria-live="polite">
                    {prompt.length === 0 ? "Required to generate" : `${prompt.length} characters`}
                  </span>
                </div>
              </div>
              <textarea
                id="app-description"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (prompt && !generating) generateApp();
                  }
                }}
                placeholder="e.g., Job board for Deaf designers with video portfolios..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            {/* Config Options */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6 space-y-4">
              
              {/* App Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Stack Type</label>
                <div className="flex gap-2" role="group" aria-label="Select stack type">
                  {appTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setConfig({...config, type})}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-pink-500 ${
                        config.type === type
                          ? 'bg-pink-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      aria-pressed={config.type === type}
                      aria-label={`Select ${type} stack type`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* TextMate Theme Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">TextMate Theme Syntax</label>
                <div className="flex gap-2" role="group" aria-label="Select TextMate syntax theme">
                  {textmateThemes.map(theme => (
                    <button
                      key={theme}
                      onClick={() => setConfig({...config, theme})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        config.theme === theme
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      aria-pressed={config.theme === theme}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippet Preset */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Code Snippet Preset</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {snippetPresets.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setConfig({...config, snippetPreset: preset.label});
                        setPrompt(prev => prev ? `${prev}\n\n// Snippet Preset: ${preset.label}` : `Generate stack with ${preset.label}`);
                      }}
                      className={`text-left px-3 py-2 rounded border text-xs font-mono transition-all ${
                        config.snippetPreset === preset.label
                          ? 'bg-slate-800 border-pink-500 text-pink-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <FileText className="w-3 h-3 inline mr-2" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Authentication</label>
                <div className="flex gap-2" role="group" aria-label="Select authentication type">
                  {authTypes.map(auth => (
                    <button
                      key={auth}
                      onClick={() => setConfig({...config, auth})}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500 ${
                        config.auth === auth
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      aria-pressed={config.auth === auth}
                      aria-label={`Select ${auth} authentication`}
                    >
                      {auth}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deploy */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Deployment</label>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select deployment platform">
                  {deployTypes.map(deploy => (
                    <button
                      key={deploy}
                      onClick={() => setConfig({...config, deploy})}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-blue-500 ${
                        config.deploy === deploy
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      aria-pressed={config.deploy === deploy}
                      aria-label={`Deploy to ${deploy}`}
                    >
                      {deploy}
                    </button>
                  ))}
                </div>
              </div>

              {/* A11y Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-300">Accessibility Suite</span>
                <button
                  onClick={() => setConfig({...config, accessibility: !config.accessibility})}
                  className={`relative w-12 h-6 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-green-500 ${
                    config.accessibility ? 'bg-green-500' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={config.accessibility}
                  aria-label="Toggle Accessibility Suite"
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    config.accessibility ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

            </div>

            {/* Generate Button */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (!prompt || generating) return;
                  generateApp();
                }}
                aria-disabled={!prompt || generating}
                aria-describedby={(!prompt || generating) ? "generate-tooltip" : undefined}
                className={`w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500 flex items-center justify-center gap-2 ${(!prompt || generating) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Magicians Working...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Generate Stack
                  <span className="hidden md:inline text-xs opacity-70 ml-2 font-normal" aria-hidden="true">
                    (⌘/Ctrl + Enter)
                  </span>
                </>
              )}
              </button>
              {(!prompt || generating) && (
                <div
                  id="generate-tooltip"
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700"
                >
                  {generating ? "Magicians are currently working..." : "Please describe your app first"}
                </div>
              )}
            </div>

          </div>

          {/* Output Section */}
          <div className="space-y-6">
            
            {generating ? (
              <div
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-12 text-center flex flex-col items-center"
                role="status"
                aria-live="polite"
              >
                <div className="w-12 h-12 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin mb-4" aria-hidden="true" />
                <p className="text-slate-400">Summoning magicians to build your stack...</p>
              </div>
            ) : output ? (
              <>
                {/* Repo Info & TextMate Syntax Highlight Preview */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-pink-500" />
                      <h3 className="font-bold">Generated Repository</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      TextMate: {config.theme}
                    </span>
                  </div>
                  <div className="bg-slate-950 rounded p-4 font-mono text-sm border border-slate-800">
                    <div className="text-green-400 mb-2">✓ {output.repo}</div>
                    {output.structure.map((line, i) => (
                      <div key={i} className="text-slate-400 ml-4">{line}</div>
                    ))}
                  </div>

                  {/* Rendered Snippet */}
                  <div className="mt-4 bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs">
                    <div className="text-slate-500 mb-1 flex items-center justify-between">
                      <span>Snippet Preview ({config.snippetPreset})</span>
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <pre className="text-purple-300 overflow-x-auto p-2 bg-slate-900/80 rounded">
                      {snippetPresets.find(p => p.label === config.snippetPreset)?.code}
                    </pre>
                  </div>
                </div>

                {/* Magician Status */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold">360 Magicians</h3>
                  </div>
                  <div className="space-y-2">
                    {output.magicians.map((mag, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-950 rounded p-3">
                        <span className="text-sm">{mag.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{mag.time}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            mag.status === 'complete' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {mag.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold">API Endpoints</h3>
                  </div>
                  <div className="space-y-2">
                    {output.endpoints.map((endpoint, i) => (
                      <div key={i} className="bg-slate-950 rounded p-3 font-mono text-xs text-slate-300">
                        {endpoint}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deploy Button */}
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-green-500">
                  <Rocket className="w-5 h-5" />
                  Deploy to {config.deploy}
                </button>
              </>
            ) : (
              <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-12 text-center">
                <Eye className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">Configure and generate to see output</p>
              </div>
            )}

          </div>

        </div>
        ) : (
        /* MappingPane Interface Builder & Flow Dev DB */
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-pink-500" />
                  MappingPane Interface Builder
                </h2>
                <p className="text-sm text-slate-400 mt-1">Configure flow routing, database schema mappings, and event dispatch bindings for dev DB.</p>
              </div>
              <button
                onClick={() => {
                  const newNode: MappingNode = {
                    id: String(Date.now()),
                    name: `Custom Flow Node ${mappingNodes.length + 1}`,
                    targetDb: `dev_db.custom_table_${mappingNodes.length + 1}`,
                    status: 'active'
                  };
                  setMappingNodes([...mappingNodes, newNode]);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-all"
              >
                + Add Mapping Node
              </button>
            </div>

            {/* Visual Flow Mapper Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {mappingNodes.map((node) => (
                <div key={node.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-pink-400" />
                      {node.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      node.status === 'mapped' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-900 p-2 rounded">
                    Target: {node.targetDb}
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Dispatch Trigger: auto</span>
                    <button
                      onClick={() => setMappingNodes(mappingNodes.filter(n => n.id !== node.id))}
                      className="text-pink-400 hover:text-pink-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dev DB Pipeline Configuration */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs">
              <div className="text-slate-400 mb-2 flex items-center gap-2 font-sans font-semibold">
                <Database className="w-4 h-4 text-blue-400" />
                Dev DB & Dispatch Pipeline Status
              </div>
              <div className="text-emerald-400">✓ Supabase Dev DB connected (localhost:5432)</div>
              <div className="text-emerald-400">✓ Workflow Dispatch webhook listener online</div>
              <div className="text-slate-400">⚡ 3 Mapping nodes synced to Fibonrose validator sequence</div>
            </div>
          </div>
        </div>
        )}

        {/* Footer Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <Shield className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">DeafAUTH</div>
            <div className="text-xs text-slate-500">Identity Layer</div>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <Database className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">Fibonrose</div>
            <div className="text-xs text-slate-500">Trust Engine</div>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">PinkSync</div>
            <div className="text-xs text-slate-500">Automation</div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ⚡ Bolt Optimization: Memoize MBTQDevGenerator component
// 💡 What: Wrapped MBTQDevGenerator export with React.memo()
// 🎯 Why: Prevents unnecessary re-renders when parent state (like theme) changes, since this component has complex internal state but takes no props.
// 📊 Impact: Eliminates heavy re-renders of the entire generator UI when the global theme changes or other App-level events occur.
export default memo(MBTQDevGenerator);
