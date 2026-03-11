import React from 'react'
import { Button } from '../ui/button'
import { PanelLeftIcon, PlusIcon, SidebarCloseIcon } from 'lucide-react'

function dashboard_sidebar() {
    return (
        <div className='w-80 border-r flex flex-col px-2 py-1.5'>
            <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground uppercase'>Dashboards</span>
                <div className='flex gap-1 items-center'>
                    <button className='p-1 text-muted-foreground hover:text-primary hover:cursor-pointer'>
                        <PlusIcon size={15} />
                    </button>
                    <button className='p-1 text-muted-foreground hover:text-primary hover:cursor-pointer'>
                        <PanelLeftIcon size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default dashboard_sidebar