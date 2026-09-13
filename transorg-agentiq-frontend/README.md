# TransOrg AgentIQ — Frontend Command Center

Enterprise React + TypeScript command center for the TransOrg AgentIQ Datathon submission, engineered with Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, and Lucide Icons.

## 🎬 Live Platform Demo Walkthrough

<p align="center">
  <video src="../assets/demo_walkthrough.mp4" controls="controls" autoplay="autoplay" muted="muted" loop="loop" width="100%" style="border-radius: 12px; max-width: 900px;">
    <source src="../assets/demo_walkthrough.mp4" type="video/mp4" />
    <a href="../assets/demo_walkthrough.mp4">▶ Play Demo Video (assets/demo_walkthrough.mp4)</a>
  </video>
</p>

## 🚀 Quickstart

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**

Production build:
```bash
npm run build
npm run preview
```

## 🏗️ Architecture & Features

1. **Product Landing Showcase** (`src/components/landing/`): Interactive workflow, security marquee, trust badges, scale statistics, conversion banner.
2. **Enterprise TOTP MFA Barrier** (`src/components/auth/AuthModal.tsx`): Two-factor authentication with dynamic QR codes, RFC 6238 TOTP validation, and role quick-picks (Executive, Analyst, Auditor).
3. **9 Full-Stack Command Center Tabs** (`src/components/dashboard/tabs/`):
   - Executive Overview (KPIs, volume trends, hourly distribution)
   - Merchant Risk & ML Isolation Forest spikes
   - Customer Risk & K-Means KYC clustering
   - Disputes & SLA root-cause analysis
   - Fraud Rings & NetworkX graph topology
   - Geo-Spatial Telemetry heatmaps
   - Agentic Copilot with **Google Gemini 3.6 Flash** & Text-to-Speech
   - Attack Sandbox (Velocity burst & synthetic identity simulations)
   - Compliance & Regulatory FIU-IND SAR generator
4. **Floating AI Copilot** (`src/components/dashboard/FloatingChatbot.tsx`): Always-accessible conversational AI assistant in the bottom-right corner of the dashboard with voice readout.
5. **Resilient Data Layer** (`src/lib/api.ts` & `src/lib/datasetSnapshot.ts`): Live REST API client with deterministic offline snapshot fallback ensuring 100% operational uptime.
