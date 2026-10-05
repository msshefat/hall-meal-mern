import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { Banner, PageHead, Star } from '../Shell'

const empty = { fullName: '', email: '', role: 'student', studentCode: '', roomNo: '', phone: '', status: 'active', password: '', balance: '0' }

export default function UserForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.get(`/api/users/${id}`).then((data) => setForm({ ...empty, ...data.user, password: '', balance: '0' })).catch((err) => setError(err.message))
  }, [id])

  function set(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    try {
      const result = editing ? await api.put(`/api/users/${id}`, form) : await api.post('/api/users', form)
      navigate('/app/users', { state: { note: result.message } })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <PageHead eyebrow="Directory" title={editing ? 'Edit person' : 'Add person'} lede={editing ? 'Leave the password blank to keep the current one. ID and mobile stay required.' : 'Every person needs an ID and a mobile number. Share the password. They can change it after signing in.'} />
      <form className="panel form-grid narrow" onSubmit={save}>
        <Banner message={error} kind="error" />
        <label>Full name <Star /><input className="form-control" value={form.fullName} onChange={set('fullName')} required /></label>
        <label>Email <Star /><input className="form-control" type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Role <Star />
          <select className="form-select" value={form.role} onChange={set('role')}>
            {['student', 'staff', 'admin'].map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <div className="pair">
          <label>ID <Star /><input className="form-control" value={form.studentCode || ''} onChange={set('studentCode')} required /></label>
          <label>Room<input className="form-control" value={form.roomNo || ''} onChange={set('roomNo')} /></label>
        </div>
        <label>Mobile number <Star /><input className="form-control" value={form.phone || ''} onChange={set('phone')} inputMode="tel" required /></label>
        <label>Status <Star />
          <select className="form-select" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="pending">Waiting for approval</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>{editing ? 'New password (optional)' : <>Password <Star /></>}
          <input className="form-control" type="text" value={form.password} onChange={set('password')} minLength={editing ? undefined : 6} required={!editing} autoComplete="new-password" />
        </label>
        {!editing ? <label>Opening balance for a student (৳)<input className="form-control" type="number" min="0" step="0.01" value={form.balance} onChange={set('balance')} /></label> : null}
        <div className="page-actions">
          <button className="btn btn-primary" type="submit">{editing ? 'Save changes' : 'Create account'}</button>
          <Link className="btn btn-quiet" to="/app/users">Cancel</Link>
        </div>
      </form>
    </>
  )
}
