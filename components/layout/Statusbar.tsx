"use client";

import { DatabaseIcon } from "lucide-react";
import Link from "next/link";

export default function Statusbar() {
    return (
        <div className="border-t flex px-2 py-1.5 items-center justify-between text-xs">
            <div className="flex items-center gap-5">
                <Link href="/" className="text-terminal-green/80" aria-label="Home">
                    <DatabaseIcon size={14} />
                </Link>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono">APEX</span>
            </div>
        </div>
    );
}
