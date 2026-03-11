import React from 'react'
import DashboardSidebar from '@/components/dash/dashboard_sidebar'

function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full h-full overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}

export default layout
