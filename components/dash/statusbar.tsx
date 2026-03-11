import { DatabaseIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Statusbar() {
    return (
        <div className='border-t flex px-2 py-1.5 items-center justify-between text-xs'>
            <div className='flex items-center gap-5'>
                <Link href="/" className='text-terminal-green/80'>
                    <DatabaseIcon size={14} />
                </Link>
            </div>
            <div className='flex items-center gap-2'>
                <h1>
                    asd
                </h1>
            </div>
        </div>
    )
}

export default Statusbar    