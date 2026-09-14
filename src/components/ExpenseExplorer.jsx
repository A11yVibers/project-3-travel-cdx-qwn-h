import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { categoryStats, currency0, grandTotal } from '../lib/tripData.js'

function DonutTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0].payload
  return (
    <div className="chart-tooltip">
      <strong>{item.label}</strong>
      <span>
        {currency0.format(item.total)} &middot; {Math.round(item.share * 100)}% of trip
      </span>
    </div>
  )
}

function BarTooltip({ active, payload, category }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0].payload
  return (
    <div className="chart-tooltip">
      <strong>
        Day {item.dayNumber} &middot; {item.city}
      </strong>
      <span>
        {category.label}: {currency0.format(item.amount)}
      </span>
      <span className="tooltip-sub">{item.dateLabel}</span>
    </div>
  )
}

function AmountLabel({ x, y, width, value }) {
  return (
    <text
      x={x + width / 2}
      y={y - 7}
      textAnchor="middle"
      fontSize={10.5}
      fill="#7a6d55"
    >
      {currency0.format(value)}
    </text>
  )
}

export default function ExpenseExplorer() {
  const [selectedKey, setSelectedKey] = useState(null)
  const selected = categoryStats.find((c) => c.key === selectedKey) ?? null

  const toggle = (key) => setSelectedKey((prev) => (prev === key ? null : key))

  const handlePieClick = (entry, index) => {
    if (typeof index === 'number' && categoryStats[index]) {
      toggle(categoryStats[index].key)
    }
  }

  const extremes = selected
    ? {
        max: selected.daily.reduce((a, b) => (b.amount > a.amount ? b : a)),
        min: selected.daily.reduce((a, b) => (b.amount < a.amount ? b : a)),
        avg: selected.total / selected.daily.length,
      }
    : null

  return (
    <div className="expense-layout">
      <section className="panel donut-panel">
        <h3 className="panel-title">Overall spending</h3>
        <p className="panel-meta">
          {currency0.format(grandTotal)} across 10 days &middot; select a slice to compare
          cities
        </p>
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="total"
                nameKey="label"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                cornerRadius={5}
                cursor="pointer"
                onClick={handlePieClick}
              >
                {categoryStats.map((cat) => (
                  <Cell
                    key={cat.key}
                    fill={cat.color}
                    fillOpacity={selectedKey && selectedKey !== cat.key ? 0.28 : 1}
                    stroke={selectedKey === cat.key ? '#3b3325' : '#fffdf7'}
                    strokeWidth={selectedKey === cat.key ? 2 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            {selected ? (
              <>
                <strong>{currency0.format(selected.total)}</strong>
                <span>
                  {selected.label} &middot; {Math.round(selected.share * 100)}%
                </span>
              </>
            ) : (
              <>
                <strong>{currency0.format(grandTotal)}</strong>
                <span>total spent</span>
              </>
            )}
          </div>
        </div>
        <ul className="legend">
          {categoryStats.map((cat) => (
            <li key={cat.key}>
              <button
                type="button"
                className={`legend-item${selectedKey === cat.key ? ' is-selected' : ''}`}
                aria-pressed={selectedKey === cat.key}
                onClick={() => toggle(cat.key)}
              >
                <span className="swatch" style={{ background: cat.color }} />
                <span className="legend-label">{cat.label}</span>
                <span className="legend-value">{currency0.format(cat.total)}</span>
                <span className="legend-share">{Math.round(cat.share * 100)}%</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel compare-panel" aria-live="polite">
        {selected && extremes ? (
          <>
            <p className="kicker">Category breakdown</p>
            <h3 className="panel-title">{selected.label} by city</h3>
            <p className="panel-meta">
              Daily {selected.label.toLowerCase()} spending at each of the 10 stops.
            </p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={selected.daily}
                  margin={{ top: 28, right: 10, left: 2, bottom: 4 }}
                >
                  <CartesianGrid vertical={false} stroke="#e9e0ca" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="city"
                    interval={0}
                    angle={-32}
                    textAnchor="end"
                    height={64}
                    tickLine={false}
                    axisLine={{ stroke: '#ddd2b9' }}
                    tick={{ fontSize: 11, fill: '#7a6d55' }}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v}`}
                    width={46}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#7a6d55' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(198, 148, 73, 0.10)' }}
                    content={<BarTooltip category={selected} />}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {selected.daily.map((d) => (
                      <Cell key={d.dayNumber} fill={selected.color} />
                    ))}
                    <LabelList dataKey="amount" position="top" content={<AmountLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="compare-notes">
              Highest: {extremes.max.city} ({currency0.format(extremes.max.amount)})
              {' · '}Lowest: {extremes.min.city} ({currency0.format(extremes.min.amount)})
              {' · '}Daily average: {currency0.format(extremes.avg)}
            </p>
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-donut" aria-hidden="true" />
            <p>
              Select a slice of the donut chart to see how that category&rsquo;s spending
              compared across all 10 cities.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
