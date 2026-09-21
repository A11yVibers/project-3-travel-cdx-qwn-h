const pad2 = (value) => String(value).padStart(2, '0')

export default function DayPanel({ day, panelId, dayCount }) {
  if (!day) return null

  return (
    <div className="day-panel" id={panelId} role="region" aria-labelledby="day-panel-title">
      <p className="sr-only" role="status">
        {`Day ${day.dayNumber}, ${day.city}. Itinerary for ${day.weekdayLong}, ${day.longMonthDay} ${day.year} shown with ${day.itinerary.length} stops.`}
      </p>

      <header className="day-panel-head">
        <div className="day-panel-title-wrap">
          <p className="eyebrow eyebrow-inline">
            <span className="eyebrow-dot" aria-hidden="true" />
            Day {pad2(day.dayNumber)} / {pad2(dayCount)}
          </p>
          <h3 id="day-panel-title" className="day-panel-title">
            {day.city}
            <span className="day-panel-country">{day.country}</span>
          </h3>
          <p className="day-panel-date">
            {day.weekdayLong}, {day.longMonthDay} {day.year}
          </p>
        </div>
        <p className="day-panel-landmark">
          <span className="day-panel-landmark-label">Landmark</span>
          {day.landmark}
        </p>
      </header>

      <div className="table-scroll">
        <table className="itinerary">
          <caption className="sr-only">
            {`Itinerary for day ${day.dayNumber} in ${day.city}, ${day.country}`}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="col-time">Time</th>
              <th scope="col" className="col-place">Place</th>
              <th scope="col" className="col-activity">Activity</th>
            </tr>
          </thead>
          <tbody>
            {day.itinerary.map((item) => (
              <tr key={`${day.dayId}-${item.order}`}>
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
