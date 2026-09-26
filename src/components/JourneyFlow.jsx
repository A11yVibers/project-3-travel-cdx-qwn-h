import { useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { formatShortDate } from '../data/tripData.js'

const NODE_COLS = [1, 3, 5, 7, 9]
const PER_ROW = NODE_COLS.length

function HorizontalConnector({ gridRow, gridColumn, direction }) {
  return (
    <div className="flow-cell conn-cell h-conn" style={{ gridRow, gridColumn }} aria-hidden="true">
      {direction === 'right' ? (
        <svg className="conn conn-h" viewBox="0 0 44 14" fill="none">
          <line x1="1" y1="7" x2="33" y2="7" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
          <path d="M34 2 L41 7 L34 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="conn conn-h" viewBox="0 0 44 14" fill="none">
          <line x1="43" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
          <path d="M10 2 L3 7 L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

function VerticalConnector({ compact }) {
  return (
    <div className={`conn-v-wrap${compact ? ' is-compact' : ''}`} aria-hidden="true">
      <svg className="conn conn-v" viewBox="0 0 14 56" fill="none">
        <line x1="7" y1="1" x2="7" y2="43" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
        <path d="M2 44 L7 51 L12 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function DayNode({ day, selected, onSelect }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <button
      type="button"
      className={`day-node${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      aria-label={`Day ${day.dayNumber}: ${day.city}, ${day.country}, ${formatShortDate(day.date)}. Show itinerary.`}
      onClick={() => onSelect(selected ? null : day.dayId)}
    >
      <span className="node-pill">Day {String(day.dayNumber).padStart(2, '0')}</span>
      <span className="frame-wrap">
        <span className="frame">
          {imageFailed ? (
            <span className="frame-fallback" aria-hidden="true">{day.city.charAt(0)}</span>
          ) : (
            <img
              src={day.imageUrl}
              alt={`${day.landmark}, ${day.city}`}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          )}
        </span>
      </span>
      <span className="node-city">{day.city}</span>
      <span className="node-date">{formatShortDate(day.date)}</span>
    </button>
  )
}

function SerpentineFlow({ days, selectedDayId, onSelect }) {
  const cells = []
  const rowCount = Math.ceil(days.length / PER_ROW)

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowDays = days.slice(rowIndex * PER_ROW, (rowIndex + 1) * PER_ROW)
    const reversed = rowIndex % 2 === 1
    const gridRow = rowIndex * 2 + 1
    const colForRow = (position) => (reversed ? NODE_COLS[rowDays.length - 1 - position] : NODE_COLS[position])

    rowDays.forEach((day, position) => {
      cells.push(
        <div className="flow-cell" key={day.dayId} role="listitem" style={{ gridRow, gridColumn: colForRow(position) }}>
          <DayNode day={day} selected={day.dayId === selectedDayId} onSelect={onSelect} />
        </div>,
      )
      if (position < rowDays.length - 1) {
        const connectorCol = (colForRow(position) + colForRow(position + 1)) / 2
        cells.push(
          <HorizontalConnector
            key={`h-${rowIndex}-${position}`}
            gridRow={gridRow}
            gridColumn={connectorCol}
            direction={reversed ? 'left' : 'right'}
          />,
        )
      }
    })

    if (rowIndex < rowCount - 1) {
      cells.push(
        <div
          className="flow-cell conn-cell"
          key={`v-${rowIndex}`}
          style={{ gridRow: gridRow + 1, gridColumn: colForRow(rowDays.length - 1) }}
          aria-hidden="true"
        >
          <VerticalConnector />
        </div>,
      )
    }
  }

  return (
    <div className="flow-grid" role="list" aria-label="Trip route, day 1 through day 10">
      {cells}
    </div>
  )
}

function StackedFlow({ days, selectedDayId, onSelect }) {
  return (
    <div className="flow-stack" role="list" aria-label="Trip route, day 1 through day 10">
      {days.map((day, index) => (
        <div className="flow-stack-item" key={day.dayId} role="listitem">
          <DayNode day={day} selected={day.dayId === selectedDayId} onSelect={onSelect} />
          {index < days.length - 1 && <VerticalConnector compact />}
        </div>
      ))}
    </div>
  )
}

export default function JourneyFlow({ days, selectedDayId, onSelect }) {
  const isWide = useMediaQuery('(min-width: 1080px)')

  return (
    <div className="journey-flow">
      {isWide ? (
        <SerpentineFlow days={days} selectedDayId={selectedDayId} onSelect={onSelect} />
      ) : (
        <StackedFlow days={days} selectedDayId={selectedDayId} onSelect={onSelect} />
      )}
    </div>
  )
}
