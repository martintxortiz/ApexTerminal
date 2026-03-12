"use client";

/* ──────────────────────────────────────────────────────────────
   TelemetryProvider — WebSocket telemetry context
   Manages a WebSocket connection to the telemetry backend and
   fans out packets to subscribers via a pub/sub pattern.
   ────────────────────────────────────────────────────────────── */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { TelemetryPacket, TelemetryContextType, PacketListener } from "@/lib/types";

// ── Defaults ────────────────────────────────────────────────────

const WS_RECONNECT_MS = 2_000;
const WS_PATH = "/ws/packets";
const WS_PORT = 8000;

// ── Context ─────────────────────────────────────────────────────

const TelemetryContext = createContext<TelemetryContextType>({
    subscribe: () => () => { },
    getLatestPacket: () => null,
    isConnected: false,
});

export const useTelemetry = () => useContext(TelemetryContext);

/**
 * Subscribe to telemetry packets without causing re-renders.
 * The provided callback fires for every incoming packet.
 */
export function useTelemetrySubscription(onPacket: PacketListener) {
    const { subscribe } = useTelemetry();
    const callbackRef = useRef(onPacket);
    callbackRef.current = onPacket;

    useEffect(() => {
        return subscribe((pkt) => callbackRef.current(pkt));
    }, [subscribe]);
}

// ── Provider ────────────────────────────────────────────────────

export const TelemetryProvider = ({ children }: { children: ReactNode }) => {
    const latestRef = useRef<TelemetryPacket | null>(null);
    const listenersRef = useRef<Set<PacketListener>>(new Set());
    const [isConnected, setIsConnected] = useState(false);

    const subscribe = useCallback((listener: PacketListener) => {
        listenersRef.current.add(listener);
        return () => {
            listenersRef.current.delete(listener);
        };
    }, []);

    const getLatestPacket = useCallback(() => latestRef.current, []);

    useEffect(() => {
        let ws: WebSocket;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        const connect = () => {
            const host = window.location.hostname;
            ws = new WebSocket(`ws://${host}:${WS_PORT}${WS_PATH}`);

            ws.onopen = () => {
                console.log("[Telemetry] Connected");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data: TelemetryPacket = JSON.parse(event.data);
                    latestRef.current = data;
                    for (const fn of listenersRef.current) fn(data);
                } catch (e) {
                    console.error("[Telemetry] Failed to parse packet", e);
                }
            };

            ws.onclose = () => {
                console.log(`[Telemetry] Disconnected. Reconnecting in ${WS_RECONNECT_MS}ms…`);
                setIsConnected(false);
                reconnectTimeout = setTimeout(connect, WS_RECONNECT_MS);
            };

            ws.onerror = () => ws.close();
        };

        connect();

        return () => {
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
        };
    }, []);

    return (
        <TelemetryContext.Provider value={{ subscribe, getLatestPacket, isConnected }}>
            {children}
        </TelemetryContext.Provider>
    );
};
