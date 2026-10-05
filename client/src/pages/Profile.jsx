import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../App'
import { Banner, PageHead, Star } from '../Shell'

export default function Profile() {
  const auth = useAuth()
  const [form, setForm] = useState(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState({ current: '', next: '' })
  const [passwordNote, setPasswordNote] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)

  useEffect(() => {
    if (!auth.user || form) return
    setForm({
      fullName: auth.user.fullName || '',
      roomNo: auth.user.roomNo || '',
      phone: auth.user.phone || ''
    })
  }, [auth.user, form])

  function set(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNote('')
    try {
      const result = await api.put('/api/profile', form)
      setNote(result.message)
      await auth.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setPasswordBusy(true)
    setPasswordError('')
    setPasswordNote('')
    try {
      const result = await api.post('/api/password', password)
      setPasswordNote(result.message)
      setPassword({ current: '', next: '' })
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordBusy(false)
    }
  }

  if (!form) return <p className="empty">Loading your profile…</p>
  return (
    <>
      <PageHead eyebrow="Account" title="Your profile" lede="Update your name, room, and mobile number. The email stays fixed, and only the hall office can change an ID." />
      <Banner message={note} />
      <Banner message={error} kind="error" />
      <form className="panel form-grid narrow" onSubmit={save}>
        <p className="stat-hint">Signed in as {auth.user.email} · {auth.user.role}</p>
        <label>Full name <Star /><input className="form-control" value={form.fullName} onChange={set('fullName')} required /></label>
        <div className="pair">
          <label>ID
            <input className="form-control" value={auth.user.studentCode || 'Not assigned'} disabled />
          </label>
          <label>Room<input className="form-control" value={form.roomNo} onChange={set('roomNo')} /></label>
        </div>
        <p className="stat-hint">Only an administrator can change an ID.</p>
        <label>Mobile number <Star /><input className="form-control" value={form.phone} onChange={set('phone')} inputMode="tel" required /></label>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </form>

      <form className="panel form-grid narrow" onSubmit={savePassword}>
        <h2>Password</h2>
        <p className="stat-hint">Use a password you have not used on another site.</p>
        <Banner message={passwordNote} />
        <Banner message={passwordError} kind="error" />
        <label>Current password <Star /><input className="form-control" type="password" value={password.current} onChange={(event) => setPassword({ ...password, current: event.target.value })} autoComplete="current-password" required /></label>
        <label>New password <Star /><input className="form-control" type="password" minLength={6} value={password.next} onChange={(event) => setPassword({ ...password, next: event.target.value })} autoComplete="new-password" required /></label>
        <button className="btn btn-primary" type="submit" disabled={passwordBusy}>{passwordBusy ? 'Updating…' : 'Update password'}</button>
      </form>
    </>
  )
}
