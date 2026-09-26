import { formatLongDate } from '../data/tripData.js'

export default function ItineraryPanel({ day, items }) {
  if (!day) {
    return (
      <div className="card itinerary-card itinerary-empty">
        <span className="empty-diamond" aria-hidden="true" />
        <p>
          <strong>No day selected.</strong>
          <br />
          Choose a stop on the journey above to open its hour-by-hour itinerary.
        </p>
      </div>
    )
  }

  return (
    <div className="card itinerary-card">
      <div className="itinerary-head">
        <div>
          <p className="itinerary-kicker">
            Day {String(day.dayNumber).padStart(2, '0')} · {formatLongDate(day.date)}
          </p>
          <h3 className="itinerary-title">
            {day.city}, <span>{day.country}</span>
          </h3>
        </div>
        <p className="itinerary-landmark">
          <span className="landmark-label">Landmark</span>
          {day.landmark}
        </p>
      </div>
      <div className="table-scroll">
      <table className="itinerary-table">
        <caption className="visually-hidden">Itinerary for day {day.dayNumber} in {day.city}</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Place</th>
            <th scope="col">Activity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.time}-${item.place}`}>
              <td className="cell-time">{item.time}</td>
              <td className="cell-place">{item.place}</td>
              <td className="cell-activity">{item.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
