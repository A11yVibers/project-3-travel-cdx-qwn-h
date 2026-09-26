import { useEffect, useRef, useState } from 'react'
import JourneyFlow from './components/JourneyFlow.jsx'
import ItineraryPanel from './components/ItineraryPanel.jsx'
import ExpenseExplorer from './components/ExpenseExplorer.jsx'
import {
  days,
  formatDateRange,
  formatUsd,
  grandTotal,
  itineraryByDay,
  tripMeta,
} from './data/tripData.js'

export default function App() {
  const [selectedDayId, setSelectedDayId] = useState(null)
  const itineraryRef = useRef(null)

  const selectedDay = days.find((day) => day.dayId === selectedDayId) ?? null

  useEffect(() => {
    if (selectedDayId && itineraryRef.current) {
      itineraryRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedDayId])

  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead-kicker">A visual travel journal</p>
        <h1 className="masthead-title">Ten Days in Europe</h1>
        <p className="masthead-meta">
          {formatDateRange(tripMeta.startDate, tripMeta.endDate)} · {tripMeta.cityCount} cities ·{' '}
          {tripMeta.countryCount} countries · {tripMeta.startCity} to {tripMeta.endCity}
        </p>
        <div className="divider" aria-hidden="true">
          <span className="divider-diamond" />
        </div>
      </header>

      <main>
        <section className="section" aria-labelledby="journey-heading">
          <div className="section-head">
            <h2 id="journey-heading">The Journey</h2>
            <p>One new city every day. Follow the route, then select a stop to open its itinerary.</p>
          </div>
          <JourneyFlow days={days} selectedDayId={selectedDayId} onSelect={setSelectedDayId} />
          <div ref={itineraryRef} className="itinerary-anchor">
            <ItineraryPanel
              day={selectedDay}
              items={selectedDay ? itineraryByDay[selectedDay.dayId] : []}
            />
          </div>
        </section>

        <section className="section" aria-labelledby="expenses-heading">
          <div className="section-head">
            <h2 id="expenses-heading">Where the Money Went</h2>
            <p>
              {formatUsd(grandTotal)} across four categories — lodging, food, entertainment, and
              travel.
            </p>
          </div>
          <ExpenseExplorer />
        </section>
      </main>

      <footer className="footer">
        <div className="divider" aria-hidden="true">
          <span className="divider-diamond" />
        </div>
        <p>
          Landmark photography via Wikimedia Commons · All amounts in USD · {tripMeta.startCity} →{' '}
          {tripMeta.endCity}, {formatDateRange(tripMeta.startDate, tripMeta.endDate)}
        </p>
      </footer>
    </div>
  )
}
