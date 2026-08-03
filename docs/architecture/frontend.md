# Frontend Architecture

MBTQ.dev treats the frontend as an interchangeable layer above the API gateway.

## Supported Frontends

| Framework | Status | Notes |
|---|---|---|
| React 18 + Vite | ✅ Current | Primary implementation in `client/` |
| Next.js | 🔜 Planned | Full-stack with App Router |
| Astro | 🔜 Planned | Static + partial hydration |
| TanStack Start | 🔜 Planned | File-based routing |
| Fresh (Deno) | 🔜 Planned | Islands architecture |

## Client Directory (`client/`)

```
client/src/
├── components/
│   ├── PinkSyncWidget.tsx        # Draggable/resizable collaboration widget
│   ├── A11yBar.tsx               # Accessibility controls bar
│   ├── Manifesto.tsx             # Community manifesto display
│   ├── VisualNotificationSystem.tsx  # Deaf-accessible visual alerts
│   ├── CaptionWidget.tsx         # Real-time caption display
│   └── SignVisualSystem/         # Sign language visual components
├── App.tsx                       # Root application
├── main.tsx                      # Entry point
└── index.css                     # Global styles + Tailwind
```

## Accessibility Standards

All frontend components must:
- Pass WCAG 2.1 AA at minimum
- Support full keyboard navigation
- Provide visual-only notifications (no audio-only cues)
- Include ARIA labels and semantic HTML
- Pass automated axe-core checks

## State Management

- Local state: React hooks
- Real-time sync: Socket.IO client → `PinkSyncWidget`
- Server state: Supabase real-time subscriptions
