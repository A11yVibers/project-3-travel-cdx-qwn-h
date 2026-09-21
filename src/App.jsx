import { useMemo, useState } from 'react'
import CategoryBreakdown from './components/CategoryBreakdown.jsx'
import DayPanel from './components/DayPanel.jsx'
import ExpenseDonut from './components/ExpenseDonut.jsx'
import JourneyFlow from './components/JourneyFlow.jsx'
import { TRIP, formatCurrency } from './lib/tripData.js'

const DAY_PANEL_ID = 'day-itinerary'
const pad2 = (value) => String(value).padStart(2, '0')

export default function App() {
  const { days, categories, summary } = TRIP
  const [selectedDayId, setSelectedDayId] = useState(() => days[0]?.dayId ?? null)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(() => categories[0]?.key ?? null)

  const selectedDay = useMemo(
    () => days.find((day) => day.dayId === selectedDayId) ?? null,
    [days, selectedDayId],
  )
  const selectedCategory = useMemo(
    () => categories.find((category) => category.key === selectedCategoryKey) ?? null,
    [categories, selectedCategoryKey],
  )

  const firstDay = days[0]
  const lastDay = days[days.length - 1]
  const dateRange =
    firstDay && lastDay
      ? `${firstDay.monthShort} ${firstDay.dayOfMonth} – ${lastDay.monthShort} ${lastDay.dayOfMonth}, ${lastDay.year}`
      : ''

  const stats = [
    { label: 'Days on the move', value: pad2(summary.dayCount) },
    { label: 'Cities', value: pad2(summary.cityCount) },
    { label: 'Countries', value: pad2(summary.countryCount) },
    { label: 'Total spent', value: formatCurrency(summary.grandTotal) },
  ]

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="masthead">
        <p className="eyebrow eyebrow-inline">
          <span className="eyebrow-dot" aria-hidden="true" />
          Travel journal · Summer 2026
        </p>
        <h1 className="masthead-title">Ten Days in Europe</h1>
        <p className="masthead-route">
          {summary.firstCity} <span aria-hidden="true">→</span> {summary.lastCity} · {dateRange}
        </p>
        <p className="masthead-deck">
          One new city every day: a loop from {summary.firstCity} to {summary.lastCity} through{' '}
          {summary.countryCount} countries, with every canal cruise, palace ticket, and corner-café
          breakfast logged along the way.
        </p>

        <dl className="masthead-stats">
          {stats.map((stat) => (
            <div className="masthead-stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <main id="main">
        <section className="panel panel-route" aria-labelledby="route-heading">
          <div className="panel-head">
            <div>
              <h2 id="route-heading" className="panel-title">
                The route
              </h2>
              <p className="panel-hint">Select a stop to open that day’s itinerary.</p>
            </div>
            <p className="panel-note" aria-hidden="true">
              {selectedDay ? `${pad2(selectedDay.dayNumber)} / ${pad2(summary.dayCount)}` : ''}
            </p>
          </div>

          <JourneyFlow
            days={days}
            selectedDayId={selectedDayId}
            onSelect={setSelectedDayId}
            panelId={DAY_PANEL_ID}
          />

          <DayPanel
            key={selectedDayId}
            day={selectedDay}
            panelId={DAY_PANEL_ID}
            dayCount={summary.dayCount}
          />
        </section>

        <section className="panel panel-spending" aria-labelledby="spending-heading">
          <div className="panel-head">
            <div>
              <h2 id="spending-heading" className="panel-title">
                Where the money went
              </h2>
              <p className="panel-hint">
                Select a slice to compare that category across all ten cities.
              </p>
            </div>
            <p className="panel-note">
              {formatCurrency(summary.grandTotal)}
              <span className="panel-note-sub">over 10 days</span>
            </p>
          </div>

          <div className="spending-grid">
            <ExpenseDonut
              categories={categories}
              selectedKey={selectedCategoryKey}
              onSelect={setSelectedCategoryKey}
              grandTotal={summary.grandTotal}
            />
            <CategoryBreakdown category={selectedCategory} />
          </div>
        </section>
      </main>

      <footer className="colophon">
        <p>
          Assembled from <code>trip_days.csv</code>, <code>itinerary.csv</code> and{' '}
          <code>expenses.csv</code>. Landmark photographs via Wikimedia Commons.
        </p>
      </footer>
    </div>
  )
}
