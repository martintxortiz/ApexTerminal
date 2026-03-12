import React from "react";
import { DashboardSidebar } from "@/components/dashboard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full h-full overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
