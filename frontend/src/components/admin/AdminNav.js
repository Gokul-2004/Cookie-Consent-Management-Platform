'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Integration',
      href: '/admin/integration',
      icon: '🚀'
    },
    {
      name: 'Banner Configuration',
      href: '/admin/banner-config',
      icon: '⚙️'
    },
    {
      name: 'Cookie Scanner',
      href: '/admin/cookie-scanner',
      icon: '🔍'
    },
    {
      name: 'Consent Reports',
      href: '/admin/consent-reports',
      icon: '📊'
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  inline-flex items-center gap-2 px-1 py-4 border-b-2 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
