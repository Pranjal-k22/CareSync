# 02 — Frontend Architecture

> **Path:** `architecture-project/02-frontend-architecture.md`  
> **Status:** Implemented & Compiled (Next.js 16.0.0 / React 19.0.0)  

```mermaid
flowchart TD
    subgraph Client_App["Next.js 16 Client App (Pages Router)"]
        IndexPage["pages/index.js (Landing / Login)"]
        DashPage["pages/dashboard.jsx (Clinical Overview)"]
        LivePage["pages/live-monitoring.jsx (Real-time Telemetry)"]
        ApptPage["pages/appointments.jsx (Scheduling)"]
        RxPage["pages/prescriptions.jsx (Medications)"]
    end

    subgraph UI_Components["UI Components (components/)"]
        LiveMon["LiveMonitor/ (WebSocketMonitor.js / LiveVitals)"]
        Visuals["Visualizations/ (Recharts Charts & Gauges)"]
        DashComp["Dashboard/ (Patient Risk Cards)"]
    end

    subgraph External_Comm["Communication Layer"]
        FetchAPI["HTTP REST Client (fetch/axios)"]
        EventSrc["EventSource (SSE /telemetry/stream)"]
    end

    LivePage --> LiveMon
    LivePage --> Visuals
    DashPage --> DashComp
    
    LiveMon --> EventSrc
    IndexPage & DashPage & ApptPage --> FetchAPI
```

## Component Breakdown
* **`pages/live-monitoring.jsx`:** Sub-second telemetry portal utilizing standard browser `EventSource` listening to `http://localhost:8000/telemetry/stream`.
* **`components/LiveMonitor/`:** Reusable React components rendering digital gauge readouts, vital status badges, and animated wave visualizers.
* **`components/Visualizations/`:** Recharts timeseries graphs (`^2.15.1`) displaying multi-parameter vitals history.
* **State Management:** Component-level React `useState` and `useEffect` hooks for dynamic UI reactivity.
