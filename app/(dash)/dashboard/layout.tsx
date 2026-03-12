import React from "react";
import { DashboardSidebar } from "@/components/dashboard";
import { TelemetryProvider } from "@/components/providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <TelemetryProvider>
            <div className="flex w-full h-full overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </TelemetryProvider>
    );
}
