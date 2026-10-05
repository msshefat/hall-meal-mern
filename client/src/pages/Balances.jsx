import { useEffect, useState } from 'react'
import { api } from '../api'
import { Banner, PageHead, Star } from '../Shell'

export default function Balances() {
  const [students, setStudents] = useState(null)
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ userId: '', kind: 'deposit', amount: '', note: '' })
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  function load(search = q) {
    return api.get(`/api/balances?q=${encodeURIComponent(search)}`).then((data) => setStudents(data.students))
  }
  useEffect(() => { load('').catch((err) => setError(err.message)) }, [])

  async function save(event) {
    event.preventDefault()
    try {
      const result = await api.post('/api/balances', form)
      setNote(result.message)
      setForm({ ...form, amount: '', note: '' })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <PageHead eyebrow="Accounts" title="Balances" lede="A deposit adds credit. A deduction reduces it. Meal charges can take a balance below zero, which means the student owes the hall." />
      <Banner message={note} />
      <Banner message={error} kind="error" />
      <form className="panel form-grid" onSubmit={save}>
        <div className="pair-wide">
          <label>Student <Star />
            <select className="form-select" value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} required>
              <option value="">Choose a student</option>
              {(students || []).map((student) => <option key={student.id} value={student.id}>{student.fullName} · {student.roomNo || 'No room'}</option>)}
            </select>
          </label>
          <label>Kind
            <select className="form-select" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
              <option value="deposit">Deposit</option>
              <option value="deduct">Deduct</option>
            </select>
          </label>
        </div>
        <div className="pair">
          <label>Amount (৳) <Star /><input className="form-control" inputMode="decimal" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></label>
          <label>Note<input className="form-control" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
        </div>
        <button className="btn btn-primary" type="submit">Record</button>
      </form>
      <form className="datebar" onSubmit={(event) => { event.preventDefault(); load().catch((err) => setError(err.message)) }}>
        <input className="form-control" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search students" aria-label="Search students" />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      <div className="table-wrap panel plain-panel">
        <table className="sheet">
          <thead><tr><th>Student</th><th>Room</th><th>Status</th><th>Balance</th></tr></thead>
          <tbody>
            {(students || []).map((student) => (
              <tr key={student.id}>
                <td><strong>{student.fullName}</strong><small>{student.studentCode}</small></td>
                <td>{student.roomNo || '—'}</td>
                <td>{student.status}</td>
                <td className={`num ${student.balance < 0 ? 'is-due-text' : ''}`}>{student.balanceLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
