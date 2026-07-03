import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { useCart } from '../store/CartContext'
import { useToast } from '../store/ToastContext'
import { parseError } from '../api'
import { Spinner } from '../components/ui'
import { homeFor } from '../roles'

const DEMO = [
  { label: 'Customer', email: 'customer@foodhub.test', password: 'Customer@123' },
  { label: 'Admin', email: 'admin@foodhub.test', password: 'Admin@123' },
  { label: 'Driver', email: 'driver@foodhub.test', password: 'Driver@123' },
]

export default function Login() {
  const { login } = useAuth()
  const { refresh } = useCart()
  const toast = useToast()
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }

  const [email, setEmail] = useState('customer@foodhub.test')
  const [password, setPassword] = useState('Customer@123')
  const [busy, setBusy] = useState(false)
  const [offerReg, setOfferReg] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setOfferReg(false)
    try {
      const u = await login(email, password)
      await refresh()
      toast('success', `Welcome back, ${u.name.split(' ')[0]}! 👋`)
      nav(loc.state?.from ?? homeFor(u.role), { replace: true })
    } catch (err) {
      const { message, offerRegistration } = parseError(err)
      toast('error', message)
      if (offerRegistration) setOfferReg(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-3xl shadow-glow">
            🍜
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            Welcome back to Food<span className="text-brand-600">Hub</span>
          </h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to order and track your food.</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
