"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";

export interface TelemetryPayload {
    timestamp?: number;
    alt_agl_m?: number;
    alt_msl_m?: number;
    mono_amount?: number;
    oxidizer_amount?: number;
    lf_amount?: number;
    ec_amount?: number;
    signal_strength?: number;
    signal_delay_s?: number;
    can_communicate?: boolean;
    [key: string]: any;
}

export interface TelemetryPacket {
    ts: number;
    mid: number;
    payload: TelemetryPayload;
}

type PacketListener = (packet: TelemetryPacket) => void;

interface TelemetryContextType {
    /** Subscribe to raw packets. Returns an unsubscribe function. */
    subscribe: (listener: PacketListener) => () => void;
    /** Latest packet (ref-based, does NOT trigger re-renders). */
    getLatestPacket: () => TelemetryPacket | null;
    isConnected: boolean;
}

const TelemetryContext = createContext<TelemetryContextType>({
    subscribe: () => () => {},
    getLatestPacket: () => null,
    isConnected: false,
});

export const useTelemetry = () => useContext(TelemetryContext);

/**
 * Hook that subscribes to telemetry packets and calls `onPacket` for each one.
 * Does NOT cause re-renders in the consuming component.
 */
export function useTelemetrySubscription(onPacket: PacketListener) {
    const { subscribe } = useTelemetry();
    const callbackRef = useRef(onPacket);
    callbackRef.current = onPacket;

    useEffect(() => {
        return subscribe((pkt) => callbackRef.current(pkt));
    }, [subscribe]);
}

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
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            const host = window.location.hostname;
            ws = new WebSocket(`ws://${host}:8000/ws/packets`);

            ws.onopen = () => {
                console.log("Connected to telemetry WebSocket");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data: TelemetryPacket = JSON.parse(event.data);
                    latestRef.current = data;
                    // Fan out to all subscribers — no React state updates here.
                    for (const fn of listenersRef.current) {
                        fn(data);
                    }
                } catch (e) {
                    console.error("Failed to parse telemetry packet", e);
                }
            };

            ws.onclose = () => {
                console.log("Disconnected from telemetry WebSocket. Reconnecting in 2s...");
                setIsConnected(false);
                reconnectTimeout = setTimeout(connect, 2000);
            };

            ws.onerror = () => {
                ws.close();
            };
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
