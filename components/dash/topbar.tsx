"use client"
import { ActivityIcon, BoltIcon, Settings, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
    {
        label: "Dashboards",
        href: "/dashboard/1"
    },
    {
        label: "Packets",
        href: "/packets"
    },
    {
        label: "Commands",
        href: "/commands"
    },
    {
        label: "Config",
        href: "/config"
    }
]

function Topbar() {
    const pathname = usePathname()
    return (
        <div className='border-b flex px-2 py-1.5 items-center justify-between text-sm'>
            <div className='flex items-center gap-4'>
                {items.map((item) => (
                    <Link key={item.label} href={item.href} className={`hover:text-primary ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}>
                        {item.label}
                    </Link>
                ))}
            </div>
            <div className='flex items-center gap-2'>
                <Link href="" className='hover:text-primary text-muted-foreground'>
                    <ActivityIcon size={14} />
                </Link>
                <Link href="" className='hover:text-primary text-muted-foreground'>
                    <BoltIcon size={14} />
                </Link>
                <Link href="" className='hover:text-primary text-muted-foreground'>
                    <UserIcon size={14} />
                </Link>
            </div>
        </div>
    )
}

export default Topbar