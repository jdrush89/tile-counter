import { useState, type FormEvent } from 'react'
import { Capacitor } from '@capacitor/core'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export function AccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) { setError('Accounts are not configured yet.'); return }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const redirect = import.meta.env.VITE_AUTH_REDIRECT_URL
        || (Capacitor.isNativePlatform() ? 'https://bananatally.me/' : new URL(import.meta.env.BASE_URL, window.location.origin).href)
      const result = creating
        ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirect } })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (result.error) throw result.error
      setPassword('')
      if (creating && !result.data.session) {
        setMessage('Check your email to confirm your account, then return here to sign in.')
      } else {
        onOpenChange(false)
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{creating ? 'Create account' : 'Sign in'}</DialogTitle>
          <DialogDescription>Save your tallies across devices. Your local tallies will be imported without deleting the local copy.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">Email<Input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label className="block text-sm">Password<Input type="password" autoComplete={creating ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={event => setPassword(event.target.value)} /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {message && <p role="status" className="text-sm">{message}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Please wait...' : creating ? 'Create account' : 'Sign in'}</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => { setCreating(!creating); setError(''); setMessage('') }}>
            {creating ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
