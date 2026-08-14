import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'

interface UserButtonProps {
  onLoginClick: () => void
}

export function UserButton({ onLoginClick }: UserButtonProps) {
  const { user, loading, signOut } = useAuth()

  if (!isSupabaseConfigured() || loading) return null

  if (!user) {
    return (
      <button
        type="button"
        onClick={onLoginClick}
        className="rounded-full border border-gold-400/40 bg-night-900/60 px-4 py-1.5 text-sm font-medium text-gold-300 transition-colors hover:border-gold-400 hover:bg-night-800"
      >
        Entrar
      </button>
    )
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    ''

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initial = (user.email?.[0] ?? '?').toUpperCase()

  return (
    <div className="flex items-center gap-2 rounded-full border border-night-700 bg-night-900/60 py-1 pl-1 pr-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-400 text-sm font-semibold text-night-950">
          {initial}
        </span>
      )}
      <span className="hidden max-w-40 truncate text-sm text-zinc-300 sm:block">
        {displayName}
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        aria-label="Sair"
        title="Sair"
        className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors hover:text-gold-300"
      >
        <LogOut size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export default UserButton
