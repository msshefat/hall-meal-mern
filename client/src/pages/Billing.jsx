import { useEffect, useState } from 'react'
import { api } from '../api'
import { Banner, PageHead } from '../Shell'

export default function Billing() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/api/billing').then(setData).catch((err) => setError(err.message)) }, [])
  if (error) return <Banner message={error} kind="error" />
  if (!data) return <p className="empty">Loading expenses…</p>
  return (
    <>
      <PageHead eyebrow="Your account" title="Expenses" lede="Meal charges appear when a bazar cost is posted. A negative balance is an amount due." />
      <section className="stat-grid">
        <article className={`stat ${data.due ? 'is-due' : ''}`}>
          <p className="stat-label">{data.due ? 'Amount due' : 'Balance'}</p>
          <p className="stat-value">{data.balanceLabel}</p>
          <p className="stat-hint">Updated when a meal rate is posted</p>
        </article>
        <article className="stat">
          <p className="stat-label">{data.monthLabel}</p>
          <p className="stat-value">{data.monthSpent}</p>
          <p className="stat-hint">Net meal charges this month</p>
        </article>
      </section>
      <div className="table-wrap panel plain-panel">
        {!data.entries.length ? <p className="empty">No ledger entries yet.</p> : (
          <table className="sheet">
            <thead><tr><th>When</th><th>Note</th><th>Type</th><th></th></tr></thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.when}</td>
                  <td>{entry.note}</td>
                  <td>{entry.type}</td>
                  <td className="num">{entry.amountLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
