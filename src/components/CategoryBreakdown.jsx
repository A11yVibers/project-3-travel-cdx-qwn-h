import { formatCurrency } from '../lib/tripData.js'

const pad2 = (value) => String(value).padStart(2, '0')

export default function CategoryBreakdown({ category }) {
  if (!category) return null

  const maxAmount = category.byDay.reduce((max, entry) => Math.max(max, entry.amount), 0)

  return (
    <div className="breakdown" role="region" aria-labelledby="breakdown-title">
      <header className="breakdown-head">
        <p className="eyebrow eyebrow-inline">
          <span className="eyebrow-dot" style={{ backgroundColor: category.color }} aria-hidden="true" />
          Daily comparison
        </p>
        <h3 id="breakdown-title" className="breakdown-title">
          {category.label} across the ten cities
        </h3>
        <p className="breakdown-deck">
          How much of each day went to {category.label.toLowerCase()}, from {category.byDay[0]?.city} to{' '}
          {category.byDay[category.byDay.length - 1]?.city}.
        </p>
      </header>

      <dl className="breakdown-stats">
        <div className="stat">
          <dt>{category.label} total</dt>
          <dd>{formatCurrency(category.total)}</dd>
        </div>
        <div className="stat">
          <dt>Per day average</dt>
          <dd>{formatCurrency(category.average)}</dd>
        </div>
        <div className="stat">
          <dt>Most spent in</dt>
          <dd>
            {category.peak.city}
            <span className="stat-note">{formatCurrency(category.peak.amount)}</span>
          </dd>
        </div>
      </dl>

      <ul className="bars" aria-label={`${category.label} spending per day, in US dollars`}>
        {category.byDay.map((entry) => {
          const percent = maxAmount > 0 ? (entry.amount / maxAmount) * 100 : 0
          const isPeak = maxAmount > 0 && entry.amount === category.peak.amount

          return (
            <li className="bar-row" key={entry.dayId}>
              <span className="bar-label">
                <span className="bar-day">Day {pad2(entry.dayNumber)}</span>
                <span className="bar-city">
                  {entry.city}
                  {isPeak ? <span className="bar-tag">highest</span> : null}
                </span>
              </span>
              <span className="bar-track" aria-hidden="true">
                <span
                  className="bar-fill"
                  style={{ width: `${percent.toFixed(2)}%`, backgroundColor: category.color }}
                />
              </span>
              <span className="bar-amount">{formatCurrency(entry.amount)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
