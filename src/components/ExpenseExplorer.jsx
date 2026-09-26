import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import {
  categoryPercent,
  categoryTotals,
  formatUsd,
  grandTotal,
  perDayTotals,
} from '../data/tripData.js'

const TOOLTIP_STYLE = {
  background: '#fffdf6',
  border: '1px solid #e2d7bd',
  borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(44, 36, 26, 0.14)',
  fontSize: '13px',
  padding: '8px 12px',
}

function renderActiveSlice(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 9} startAngle={startAngle} endAngle={endAngle} fill={fill} />
}

export default function ExpenseExplorer() {
  const [selectedKey, setSelectedKey] = useState(null)
  const isCompact = useMediaQuery('(max-width: 760px)')

  const selected = categoryTotals.find((category) => category.key === selectedKey) ?? null
  const selectedIndex = selected ? categoryTotals.findIndex((category) => category.key === selected.key) : -1

  const perDay = useMemo(() => (selected ? perDayTotals(selected.key) : []), [selected])
  const extremes = useMemo(() => {
    if (perDay.length === 0) return null
    let max = perDay[0]
    let min = perDay[0]
    for (const entry of perDay) {
      if (entry.total > max.total) max = entry
      if (entry.total < min.total) min = entry
    }
    return { max, min }
  }, [perDay])

  const toggleCategory = (key) => setSelectedKey((current) => (current === key ? null : key))

  const renderCityTick = ({ x, y, payload }) => {
    if (isCompact) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text className="tick-city" transform="rotate(-40)" textAnchor="end" dx={-6} dy={8}>
            {payload.value}
          </text>
        </g>
      )
    }
    const entry = perDay.find((item) => item.city === payload.value)
    return (
      <g transform={`translate(${x},${y})`}>
        <text className="tick-city" textAnchor="middle" dy={16}>
          {payload.value}
        </text>
        <text className="tick-day" textAnchor="middle" dy={31}>
          Day {entry?.dayNumber}
        </text>
      </g>
    )
  }

  return (
    <div className="expense-explorer">
      <div className="card expense-main">
        <div className="donut-col">
          <h3>Spending by category</h3>
          <p className="card-sub">Select a slice to compare the ten cities.</p>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={290}>
              <PieChart role="img" aria-label={`Donut chart of trip spending: ${categoryTotals.map((c) => `${c.label} ${formatUsd(c.total)}, ${categoryPercent(c.total)} percent`).join('; ')}`}>
                <Pie
                  data={categoryTotals}
                  dataKey="total"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="84%"
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="#fffdf6"
                  strokeWidth={2}
                  activeIndex={selectedIndex}
                  activeShape={renderActiveSlice}
                  onClick={(entry) => {
                    const key = entry?.payload?.key
                    if (key) toggleCategory(key)
                  }}
                >
                  {categoryTotals.map((category) => (
                    <Cell key={category.key} fill={category.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ padding: 0 }}
                  formatter={(value, name) => [`${formatUsd(value)} · ${categoryPercent(value)}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center" aria-hidden="true">
              {selected ? (
                <>
                  <span className="center-label">{selected.label}</span>
                  <span className="center-amount">{formatUsd(selected.total)}</span>
                  <span className="center-pct">{categoryPercent(selected.total)}% of trip</span>
                </>
              ) : (
                <>
                  <span className="center-label">Total spent</span>
                  <span className="center-amount">{formatUsd(grandTotal)}</span>
                  <span className="center-pct">10 days · 10 cities</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="legend-col">
          <h3>
            Category totals <span className="legend-grand">{formatUsd(grandTotal)}</span>
          </h3>
          <ul className="legend-list">
            {categoryTotals.map((category) => {
              const isSelected = category.key === selectedKey
              return (
                <li key={category.key}>
                  <button
                    type="button"
                    className={`legend-item${isSelected ? ' is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => toggleCategory(category.key)}
                  >
                    <span className="legend-swatch" style={{ backgroundColor: category.color }} aria-hidden="true" />
                    <span className="legend-label">{category.label}</span>
                    <span className="legend-value">
                      {formatUsd(category.total)} · {categoryPercent(category.total)}%
                    </span>
                    <span className="legend-meter" aria-hidden="true">
                      <span style={{ width: `${(category.total / grandTotal) * 100}%`, backgroundColor: category.color }} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="card expense-compare" aria-live="polite">
        {selected && extremes ? (
          <>
            <div className="compare-head">
              <h3>
                <span className="compare-dot" style={{ backgroundColor: selected.color }} aria-hidden="true" />
                {selected.label} across the ten cities
              </h3>
              <p className="card-sub">
                Highest in {extremes.max.city} ({formatUsd(extremes.max.total)}) · lowest in {extremes.min.city} ({formatUsd(extremes.min.total)})
              </p>
            </div>
            <ul className="visually-hidden">
              {perDay.map((entry) => (
                <li key={entry.dayId}>
                  Day {entry.dayNumber}, {entry.city}: {formatUsd(entry.total)} on {selected.label.toLowerCase()}
                </li>
              ))}
            </ul>
            <div className="compare-chart">
              <ResponsiveContainer width="100%" height={isCompact ? 300 : 330}>
                <BarChart data={perDay} margin={{ top: 26, right: 12, bottom: 4, left: 4 }} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke="#e9e0ca" strokeDasharray="3 5" />
                  <XAxis
                    dataKey="city"
                    interval={0}
                    tickLine={false}
                    axisLine={{ stroke: '#ddd2b8' }}
                    height={isCompact ? 66 : 50}
                    tick={renderCityTick}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fontSize: 12, fill: '#6b5f4d' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(62, 74, 117, 0.07)' }}
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(city) => {
                      const entry = perDay.find((item) => item.city === city)
                      return `Day ${entry?.dayNumber} · ${city}`
                    }}
                    formatter={(value) => [formatUsd(value), selected.label]}
                  />
                  <Bar dataKey="total" name={selected.label} fill={selected.color} radius={[7, 7, 0, 0]} maxBarSize={46}>
                    {!isCompact && (
                      <LabelList dataKey="total" position="top" formatter={(value) => `$${value}`} className="bar-value" />
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="compare-empty">
            <span className="empty-diamond" aria-hidden="true" />
            <p>
              <strong>Pick a category.</strong>
              <br />
              Select a slice of the donut to see how that spending moved from city to city, day by day.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
