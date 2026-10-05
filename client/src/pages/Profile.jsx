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

  useEffect(() => {
    if (!auth.user || form) return
    setForm({
      fullName: auth.user.fullName || '',
      studentCode: auth.user.studentCode || '',
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

  if (!form) return <p className="empty">Loading your profile…</p>
  return (
    <>
      <PageHead eyebrow="Account" title="Your profile" lede="Update the name, ID, room, and mobile number on your hall record. The email stays fixed so sign-in does not break." />
      <Banner message={note} />
      <Banner message={error} kind="error" />
      <form className="panel form-grid narrow" onSubmit={save}>
        <p className="stat-hint">Signed in as {auth.user.email} · {auth.user.role}</p>
        <label>Full name <Star /><input className="form-control" value={form.fullName} onChange={set('fullName')} required /></label>
        <div className="pair">
          <label>ID <Star /><input className="form-control" value={form.studentCode} onChange={set('studentCode')} required /></label>
          <label>Room<input className="form-control" value={form.roomNo} onChange={set('roomNo')} /></label>
        </div>
        <label>Mobile number <Star /><input className="form-control" value={form.phone} onChange={set('phone')} inputMode="tel" required /></label>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </form>
    </>
  )
}
