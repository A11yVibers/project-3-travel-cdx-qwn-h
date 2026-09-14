import { useState } from 'react'

function NodeImage({ day }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className="diamond diamond-fallback">
        <span className="fallback-initial">{day.city.charAt(0)}</span>
      </span>
    )
  }
  return (
    <span className="diamond">
      <img
        src={day.imageUrl}
        alt={`${day.landmark} in ${day.city}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  )
}

export default function JourneyFlow({ days, selectedDayId, onSelectDay }) {
  return (
    <ol className="journey">
      {days.map((day, index) => {
        const selected = day.dayId === selectedDayId
        const side = index % 2 === 0 ? 'left' : 'right'
        return (
          <li key={day.dayId} className={`journey-row side-${side}`}>
            <button
              type="button"
              className="node"
              aria-pressed={selected}
              aria-controls="itinerary-panel"
              title={`Day ${day.dayNumber}: ${day.city} — show itinerary`}
              onClick={() => onSelectDay(day.dayId)}
            >
              <NodeImage day={day} />
              <span className="node-label">
                <span className="node-city">{day.city}</span>
                <span className="node-date">{day.dateLabel}</span>
              </span>
            </button>
            <span className="joint" aria-hidden="true">
              <span className={`joint-dot${selected ? ' is-selected' : ''}`}>
                {day.dayNumber}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
