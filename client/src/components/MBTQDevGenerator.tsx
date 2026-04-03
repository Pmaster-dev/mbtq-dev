import { useState, memo } from 'react';
import { Code, Database, Rocket, Zap, Shield, Eye } from 'lucide-react';

interface Config {
  type: string;
  auth: string;
  accessibility: boolean;
  deploy: string;
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

const MBTQDevGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<Config>({
    type: 'fullstack',
    auth: 'deafauth',
    accessibility: true,
    deploy: 'docker'
  });
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
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-10 h-10 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              MBTQ.dev
            </h1>
          </div>
          <p className="text-slate-400">AI-Powered Full Stack Generator • Deaf-First • LGBTQ+ Safe</p>
        </div>

        {/* Main Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            
            {/* Prompt Input */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
              <label className="block text-sm font-medium mb-3 text-slate-300">
                Describe Your App
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Job board for Deaf designers with video portfolios..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

              {/* Auth */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Authentication</label>
                <div className="flex gap-2" role="group" aria-label="Select authentication type">
                  {authTypes.map(auth => (
                    <button
                      key={auth}
                      onClick={() => setConfig({...config, auth})}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                  className={`relative w-12 h-6 rounded-full transition-all ${
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
            <button
              onClick={generateApp}
              disabled={!prompt || generating}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                </>
              )}
            </button>

          </div>

          {/* Output Section */}
          <div className="space-y-6">
            
            {output ? (
              <>
                {/* Repo Info */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-5 h-5 text-pink-500" />
                    <h3 className="font-bold">Generated Repository</h3>
                  </div>
                  <div className="bg-slate-950 rounded p-4 font-mono text-sm">
                    <div className="text-green-400 mb-2">✓ {output.repo}</div>
                    {output.structure.map((line, i) => (
                      <div key={i} className="text-slate-400 ml-4">{line}</div>
                    ))}
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
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
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
