import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import './AuthModal.css'

type Mode = 'login' | 'signup'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithPassword, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
    setError(null)
    setMessage(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    if (mode === 'login') {
      const result = await signInWithPassword(email, password)
      if (result.error) setError(result.error)
      else onClose()
    } else {
      const result = await signUp(email, password)
      if (result.error) setError(result.error)
      else if (result.needsEmailConfirmation)
        setMessage('Enviamos um link de confirmação para o seu e-mail.')
      else onClose()
    }

    setSubmitting(false)
  }

  const handleGoogle = async () => {
    setError(null)
    setMessage(null)
    await signInWithGoogle()
  }

  return (
    <motion.div
      className="auth-modal__backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Entrar' : 'Criar conta'}
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="auth-modal__close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <h2 className="font-display text-2xl font-semibold text-gold-300">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {mode === 'login'
            ? 'Bem-vindo de volta à roleta do Oscar.'
            : 'Crie sua conta e acompanhe sua Oscar List.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              E-mail
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              className="auth-modal__input"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Senha
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="auth-modal__input"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-emerald-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-night-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? mode === 'login'
                ? 'Entrando…'
                : 'Criando conta…'
              : mode === 'login'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-zinc-600">
          <span className="h-px flex-1 bg-night-700" />
          ou
          <span className="h-px flex-1 bg-night-700" />
        </div>

        <button
          type="button"
          onClick={() => void handleGoogle()}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-night-900 transition-opacity hover:opacity-90"
        >
          <GoogleIcon />
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-gold-400 hover:text-gold-300"
          >
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>

      </motion.div>
    </motion.div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

export default AuthModal
