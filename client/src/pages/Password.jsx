import { useState } from 'react'
import { api } from '../api'
import { Banner, PageHead, Star } from '../Shell'

export default function Password() {
  const [form, setForm] = useState({ current: '', next: '' })
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  async function save(event) {
    event.preventDefault()
    setError('')
    try {
      const result = await api.post('/api/password', form)
      setNote(result.message)
      setForm({ current: '', next: '' })
    } catch (err) {
      setNote('')
      setError(err.message)
    }
  }
  return (
    <>
      <PageHead eyebrow="Account" title="Password" lede="Use a password you have not used on another site." />
      <Banner message={note} />
      <Banner message={error} kind="error" />
      <form className="panel form-grid narrow" onSubmit={save}>
        <label>Current password <Star /><input className="form-control" type="password" value={form.current} onChange={(event) => setForm({ ...form, current: event.target.value })} required /></label>
        <label>New password <Star /><input className="form-control" type="password" minLength={6} value={form.next} onChange={(event) => setForm({ ...form, next: event.target.value })} required /></label>
        <button className="btn btn-primary" type="submit">Update password</button>
      </form>
    </>
  )
}
