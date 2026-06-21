'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  siswa: 'Kelola Siswa',
  staff: 'Kelola Guru',
  kelas: 'Kelola Kelas',
  'tahun-ajaran': 'Tahun Ajaran',
  'mutabaah-items': 'Template Mutabaah',
  'assign-guru': 'Penugasan Guru',
  'kenaikan-kelas': 'Kenaikan Kelas',
  export: 'Export Data',
  guru: 'Dashboard',
  tahfiz: 'Tahfizh',
  wafa: 'Wafa',
  'atur-mutabaah': 'Atur Item Mutabaah',
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const items: BreadcrumbItem[] = []
  let accumulatedPath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    accumulatedPath += `/${segment}`

    // Skip role segment (admin/guru/orangtua) but add home link
    if (['admin', 'guru', 'orangtua'].includes(segment) && i === 0) {
      items.push({ label: ROUTE_LABELS[segment] || segment, href: accumulatedPath })
      continue
    }

    const label = ROUTE_LABELS[segment] || segment
    const isLast = i === segments.length - 1

    if (isLast) {
      items.push({ label })
    } else {
      items.push({ label, href: accumulatedPath })
    }
  }

  if (items.length === 0) return null

  return (
    <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          {idx > 0 && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-neutral-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
