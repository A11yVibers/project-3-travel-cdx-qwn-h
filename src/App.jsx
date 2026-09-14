import { useState } from 'react'
import JourneyFlow from './components/JourneyFlow.jsx'
import ItineraryPanel from './components/ItineraryPanel.jsx'
import ExpenseExplorer from './components/ExpenseExplorer.jsx'
import { currency0, days, grandTotal, itineraryByDayId, tripStats } from './lib/tripData.js'

export default function App() {
  const [selectedDayId, setSelectedDayId] = useState(days[0].dayId)
  const selectedDay = days.find((d) => d.dayId === selectedDayId) ?? days[0]
  const lastDay = days[days.length - 1]

  return (
    <div className="page">
      <header className="hero">
        <p className="kicker">A visual travel journal</p>
        <h1>Ten Days in Europe</h1>
        <p className="subtitle">
          {days[0].city} &rarr; {lastDay.city} &middot; June 1&ndash;10, 2026
        </p>
        <div className="stat-strip">
          <span className="stat">
            <strong>{tripStats.cityCount}</strong> cities
          </span>
          <span className="stat">
            <strong>{tripStats.countryCount}</strong> countries
          </span>
          <span className="stat">
            <strong>{currency0.format(grandTotal)}</strong> spent
          </span>
        </div>
      </header>

      <main>
        <section className="section">
          <p className="kicker">The journey</p>
          <h2>Ten cities, ten days</h2>
          <p className="section-intro">
            Follow the route day by day &mdash; select a stop to read its itinerary.
          </p>
          <div className="journey-layout">
            <JourneyFlow
              days={days}
              selectedDayId={selectedDayId}
              onSelectDay={setSelectedDayId}
            />
            <div className="journey-side">
              <ItineraryPanel
                day={selectedDay}
                items={itineraryByDayId.get(selectedDay.dayId) ?? []}
              />
            </div>
          </div>
        </section>

        <section className="section">
          <p className="kicker">The ledger</p>
          <h2>Where the money went</h2>
          <p className="section-intro">
            Trip spending by category &mdash; select a slice to compare the ten cities.
          </p>
          <ExpenseExplorer />
        </section>
      </main>

      <footer className="footer">
        Sources: trip_days.csv &middot; itinerary.csv &middot; expenses.csv &mdash; landmark
        photos via Wikimedia Commons.
      </footer>
    </div>
  )
}
