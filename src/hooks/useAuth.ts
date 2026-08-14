import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export interface AuthActionResult {
  error: string | null
  needsEmailConfirmation?: boolean
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha inválidos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters':
    'A senha deve ter pelo menos 6 caracteres.',
  'Signups not allowed for this instance': 'O cadastro não está disponível no momento.',
  'For security purposes, you can only request this after 30 seconds.':
    'Aguarde alguns instantes antes de tentar novamente.',
}

function toAuthErrorMessage(error: { message: string } | null): string | null {
  if (!error) return null
  return AUTH_ERROR_MESSAGES[error.message] ?? 'Algo deu errado. Tente novamente.'
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!supabase) return

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setReady(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        setReady(true)
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const loading = isSupabaseConfigured() && !ready
  const user = session?.user ?? null

  const signInWithPassword = async (
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    if (!supabase) return { error: 'Autenticação indisponível.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: toAuthErrorMessage(error) }
  }

  const signUp = async (
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    if (!supabase) return { error: 'Autenticação indisponível.' }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: toAuthErrorMessage(error) }
    if (!data.session) {
      return { error: null, needsEmailConfirmation: true }
    }
    return { error: null }
  }

  const signInWithGoogle = async (): Promise<AuthActionResult> => {
    if (!supabase) return { error: 'Autenticação indisponível.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { error: toAuthErrorMessage(error) }
  }

  const signOut = async (): Promise<void> => {
    await supabase?.auth.signOut()
  }

  return {
    user,
    loading,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    signOut,
  }
}
