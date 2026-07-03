import { useEffect, useMemo, useState } from 'react'
import { parseError, restaurantApi } from '../api'
import type { Restaurant } from '../types'
import { PageLoader, Stars, cx } from '../components/ui'
import { useAuth } from '../store/AuthContext'
import { useToast } from '../store/ToastContext'

function Stat({ label, value, tone = 'brand' }: { label: string; value: string | number; tone?: 'brand' | 'emerald' | 'ink' }) {
  const tones = { brand: 'from-brand-500 to-brand-600', emerald: 'from-emerald-500 to-emerald-600', ink: 'from-ink-600 to-ink-800' }
  return (
    <div className="card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={cx('mt-1 bg-gradient-to-br bg-clip-text text-3xl font-extrabold text-transparent', tones[tone])}>{value}</p>
    </div>
  )
}

export default function AdminConsole() {
  const { user } = useAuth()
  const toast = useToast()
  const [list, setList] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        setList((await restaurantApi.browse({})).results)
      } catch (e) {
        toast('error', parseError(e).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const stats = useMemo(() => {
    const open = list.filter((r) => r.isOpen).length
    const cuisines = new Set(list.map((r) => r.cuisine)).size
    const avg = list.length ? list.reduce((s, r) => s + Number(r.rating), 0) / list.length : 0
    return { total: list.length, open, closed: list.length - open, cuisines, avg: avg.toFixed(1) }
  }, [list])

  if (loading) return <PageLoader label="Loading admin console…" />

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">ADMIN CONSOLE</span>
        <h1 className="mt-3 text-2xl font-extrabold text-ink-900">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-ink-500">Manage restaurant listings and the delivery fleet · monitor analytics.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Restaurants" value={stats.total} />
        <Stat label="Open now" value={stats.open} tone="emerald" />
