import { useEffect, useState } from 'react'
import { api } from '../api'
import { todayInput } from './dates'
import { Banner, PageHead } from '../Shell'

export default function Reports() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  function load(nextStart, nextEnd) {
    const query = new URLSearchParams()
    if (nextStart) query.set('start', nextStart)
    if (nextEnd) query.set('end', nextEnd)
    return api.get(`/api/reports?${query}`).then((next) => {
      setData(next)
      setStart(next.start)
      setEnd(next.end)
    })
  }
  useEffect(() => { load().catch((err) => setError(err.message)) }, [])

  if (error && !data) return <Banner message={error} kind="error" />
  return (
    <>
      <PageHead eyebrow="Mess book" title="Reports" lede="Bazar against what was actually charged. The gap is undistributed paisa." />
      <form className="datebar" onSubmit={(event) => { event.preventDefault(); load(start, end).catch((err) => setError(err.message)) }}>
        <input className="form-control" type="date" value={start || todayInput()} onChange={(event) => setStart(event.target.value)} />
        <input className="form-control" type="date" value={end || todayInput()} onChange={(event) => setEnd(event.target.value)} />
        <button className="btn btn-primary" type="submit">Show</button>
      </form>
      <Banner message={error} kind="error" />
      {data ? (
        <>
          <section className="stat-grid">
            <article className="stat"><p className="stat-label">Breakfast</p><p className="stat-value">{data.totals.breakfast}</p></article>
            <article className="stat"><p className="stat-label">Lunch</p><p className="stat-value">{data.totals.lunch}</p></article>
            <article className="stat"><p className="stat-label">Dinner</p><p className="stat-value">{data.totals.dinner}</p></article>
            <article className="stat"><p className="stat-label">Bazar / charged</p><p className="stat-value">{data.totals.costLabel}</p><p className="stat-hint">Charged {data.totals.postedLabel} · left {data.totals.undistributedLabel}</p></article>
          </section>
          <div className="table-wrap panel plain-panel">
            <table className="sheet">
              <thead><tr><th>Day</th><th>Meal</th><th>On</th><th>Bazar</th><th>Rate</th><th>Left over</th></tr></thead>
              <tbody>
                {data.days.flatMap((day) => day.meals.map((meal) => (
                  <tr key={`${day.date}-${meal.meal}`}>
                    <td>{meal.meal === 'breakfast' ? day.label : ''}</td>
                    <td>{meal.label}</td>
                    <td>{meal.orders}</td>
                    <td>{meal.costLabel}</td>
                    <td>{meal.rateLabel}</td>
                    <td>{meal.roundingLabel}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </>
      ) : <p className="empty">Building the report…</p>}
    </>
  )
}
