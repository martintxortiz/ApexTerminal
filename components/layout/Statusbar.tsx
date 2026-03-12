"use client";

import { DatabaseIcon } from "lucide-react";
import Link from "next/link";
import { useTelemetry } from "@/components/providers";

export default function Statusbar() {
    const { isConnected } = useTelemetry();

    return (
        <div className="border-t flex px-2 py-1.5 items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className={isConnected ? "text-terminal-green" : "text-terminal-red"}
                    aria-label={isConnected ? "Connected" : "Disconnected"}
                    title={isConnected ? "Telemetry Connected" : "Telemetry Disconnected"}
                >
                    <DatabaseIcon size={14} />
                </Link>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono">APEX</span>
            </div>
        </div>
    );
}
