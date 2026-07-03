import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cartApi, parseError, restaurantApi } from '../api'
import type { MenuItem, Restaurant } from '../types'
import { PageLoader, Stars, cx, money } from '../components/ui'
import { useAuth } from '../store/AuthContext'
import { useCart } from '../store/CartContext'
import { useToast } from '../store/ToastContext'

const ART: Record<string, { e: string; g: string }> = {
  Malay: { e: '🍛', g: 'from-amber-400 to-orange-500' },
  Japanese: { e: '🍣', g: 'from-rose-400 to-pink-500' },
  Italian: { e: '🍕', g: 'from-red-400 to-rose-500' },
  Indian: { e: '🍲', g: 'from-yellow-400 to-amber-500' },
  American: { e: '🍔', g: 'from-orange-400 to-red-500' },
}
const art = (c?: string) => (c && ART[c]) || { e: '🍴', g: 'from-brand-400 to-brand-600' }

export default function Menu() {
  const { id } = useParams()
  const rid = Number(id)
  const nav = useNavigate()
  const { isAuthed } = useAuth()
  const { refresh } = useCart()
  const toast = useToast()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [browse, menu] = await Promise.all([restaurantApi.browse({}), restaurantApi.menu(rid)])
        setRestaurant(browse.results.find((r) => r.id === rid) ?? null)
        setItems(menu)
      } catch (e) {
        toast('error', parseError(e).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [rid, toast])

  const closed = restaurant ? !restaurant.isOpen : false

  const add = async (item: MenuItem) => {
    if (!isAuthed) {
      nav('/login', { state: { from: `/restaurants/${rid}` } })
      return
    }
    setAdding(item.id)
    try {
      await cartApi.addItem(item.id, 1)
      await refresh()
      toast('success', `Added ${item.name} to cart 🛒`)
    } catch (e) {
      toast('error', parseError(e).message)
    } finally {
      setAdding(null)
