import React from 'react'
import DashboardSidebar from '@/components/dash/dashboard_sidebar'
import { TelemetryProvider } from '@/components/dash/TelemetryContext'

function layout({ children }: { children: React.ReactNode }) {
    return (
        <TelemetryProvider>
            <div className="flex w-full h-full overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </TelemetryProvider>
    )
}

export default layout
