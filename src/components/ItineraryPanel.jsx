export default function ItineraryPanel({ day, items }) {
  return (
    <section className="panel itinerary-panel" id="itinerary-panel" aria-live="polite">
      <p className="kicker">Day {day.dayNumber} itinerary</p>
      <h3 className="panel-title">
        {day.city}, {day.country}
      </h3>
      <p className="panel-meta">
        {day.fullDateLabel} &middot; {day.landmark}
      </p>
      <table className="itinerary-table">
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Place</th>
            <th scope="col">Activity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.order}-${item.time}`}>
              <td className="time-cell">{item.time}</td>
              <td className="place-cell">{item.place}</td>
              <td>{item.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
