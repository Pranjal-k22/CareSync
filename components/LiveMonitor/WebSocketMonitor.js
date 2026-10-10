import { useEffect, useRef, useState } from "react";

/**
 * Stage 7 Telemetry Monitor Component (Next.js / Realtime Stream).
 * 
 * Replaces the legacy WebSocket server connection with a secure,
 * server-managed Server-Sent Events (SSE) stream (/telemetry/stream).
 * 
 * Manages connection state, stale detection (>10s), React 18 Strict Mode cleanup,
 * and patient/device/hospital tenant isolation filters.
 */
export default function WebSocketMonitor({
  onData,
  patientId,
  hospitalId,
  deviceId,
  onStatusChange
}) {
  const [connectionState, setConnectionState] = useState("CONNECTING");
  const eventSourceRef = useRef(null);
  const lastTelemetryTsRef = useRef(Date.now());
  const staleTimerRef = useRef(null);

  useEffect(() => {
    // Determine backend SSE stream endpoint URL
    const backendUrl = process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://127.0.0.1:8000";
    const params = new URLSearchParams();
    if (patientId) params.append("patient_id", patientId);
    if (hospitalId) params.append("hospital_id", hospitalId);
    if (deviceId) params.append("device_id", deviceId);

    const streamUrl = `${backendUrl}/telemetry/stream?${params.toString()}`;

    // Clean up any existing EventSource connection before establishing new filter
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionState("CONNECTING");
    if (onStatusChange) onStatusChange("CONNECTING");

    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionState("CONNECTED");
      if (onStatusChange) onStatusChange("CONNECTED");
      lastTelemetryTsRef.current = Date.now();
    };

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.event === "connected" || parsed.event === "heartbeat") {
          return;
        }

        lastTelemetryTsRef.current = Date.now();
        setConnectionState("CONNECTED");
        if (onStatusChange) onStatusChange("CONNECTED");

        if (onData && typeof onData === "function") {
          onData(parsed);
        }
      } catch (err) {
        console.warn("Telemetry SSE payload parse error:", err);
      }
    };

    es.onerror = (err) => {
      if (es.readyState === EventSource.CLOSED) {
        setConnectionState("DISCONNECTED");
        if (onStatusChange) onStatusChange("DISCONNECTED");
      } else {
        setConnectionState("ERROR");
        if (onStatusChange) onStatusChange("ERROR");
      }
    };

    // Stale telemetry check timer (10 seconds threshold)
    staleTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastTelemetryTsRef.current;
      if (elapsed > 30000) {
        setConnectionState("DEVICE_OFFLINE");
        if (onStatusChange) onStatusChange("DEVICE_OFFLINE");
      } else if (elapsed > 10000 && connectionState === "CONNECTED") {
        setConnectionState("STALE");
        if (onStatusChange) onStatusChange("STALE");
      }
    }, 3000);

    // React 18 Strict Mode cleanup callback
    return () => {
      if (staleTimerRef.current) {
        clearInterval(staleTimerRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [patientId, hospitalId, deviceId]);

  return null;
}