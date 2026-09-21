import { useMemo, useState } from 'react'
import { formatCurrency, formatPercent } from '../lib/tripData.js'

const SIZE = 264
const CENTER = SIZE / 2
const R_OUTER = 116
const R_INNER = 73
const PAD_ANGLE = 0.024
const POP_SELECTED = 9
const POP_HOVER = 4

function polar(radius, angle) {
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)]
}

function sectorPath(startAngle, endAngle) {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  const [outerStartX, outerStartY] = polar(R_OUTER, startAngle)
  const [outerEndX, outerEndY] = polar(R_OUTER, endAngle)
  const [innerEndX, innerEndY] = polar(R_INNER, endAngle)
  const [innerStartX, innerStartY] = polar(R_INNER, startAngle)

  return [
    `M ${outerStartX.toFixed(3)} ${outerStartY.toFixed(3)}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${outerEndX.toFixed(3)} ${outerEndY.toFixed(3)}`,
    `L ${innerEndX.toFixed(3)} ${innerEndY.toFixed(3)}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${innerStartX.toFixed(3)} ${innerStartY.toFixed(3)}`,
    'Z',
  ].join(' ')
}

function buildSlices(categories) {
  const total = categories.reduce((sum, category) => sum + category.total, 0)
  if (total <= 0) return []

  const funded = categories.filter((category) => category.total > 0)
  let cursor = -Math.PI / 2

  return funded.map((category) => {
    const fullSweep = (category.total / total) * Math.PI * 2
    const sweep = funded.length === 1 ? Math.PI * 2 - 0.001 : fullSweep
    const pad = Math.min(PAD_ANGLE, sweep / 4)
    const startAngle = cursor + pad
    const endAngle = cursor + sweep - pad
    const midAngle = cursor + sweep / 2
    cursor += fullSweep

    return {
      ...category,
      startAngle,
      endAngle,
      midAngle,
      path: sectorPath(startAngle, endAngle),
    }
  })
}

export default function ExpenseDonut({ categories, selectedKey, onSelect, grandTotal }) {
  const [hoveredKey, setHoveredKey] = useState(null)
  const slices = useMemo(() => buildSlices(categories), [categories])

  const activeKey = hoveredKey ?? selectedKey
  const active = slices.find((slice) => slice.key === activeKey) ?? null

  const select = (key) => {
    setHoveredKey(null)
    onSelect(key)
  }

  return (
    <div className="donut-block">
      <div className="donut">
        <svg
          className="donut-svg"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="group"
          aria-label="Trip spending distribution by category"
        >
          <circle
            className="donut-track"
            cx={CENTER}
            cy={CENTER}
            r={(R_OUTER + R_INNER) / 2}
            fill="none"
            strokeWidth={R_OUTER - R_INNER}
            aria-hidden="true"
          />
          {slices.map((slice) => {
            const isSelected = slice.key === selectedKey
            const isHovered = slice.key === hoveredKey
            const pop = isSelected ? POP_SELECTED : isHovered ? POP_HOVER : 0
            const shiftX = Math.cos(slice.midAngle) * pop
            const shiftY = Math.sin(slice.midAngle) * pop

            return (
              <path
                key={slice.key}
                className="slice"
                data-state={isSelected ? 'selected' : 'idle'}
                d={slice.path}
                fill={slice.color}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${slice.label}: ${formatCurrency(slice.total)}, ${formatPercent(
                  slice.share,
                  1,
                )} of trip spending. Show daily comparison.`}
                style={{
                  transform: `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`,
                  opacity: activeKey && !isSelected && !isHovered ? 0.4 : 1,
                }}
                onClick={() => select(slice.key)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    event.preventDefault()
                    select(slice.key)
                  }
                }}
                onMouseEnter={() => setHoveredKey(slice.key)}
                onMouseLeave={() => setHoveredKey((current) => (current === slice.key ? null : current))}
                onFocus={() => setHoveredKey(slice.key)}
                onBlur={() => setHoveredKey((current) => (current === slice.key ? null : current))}
              >
                <title>{`${slice.label}: ${formatCurrency(slice.total)} (${formatPercent(
                  slice.share,
                  1,
                )})`}</title>
              </path>
            )
          })}
        </svg>

        <div className="donut-center" aria-hidden="true">
          {active ? (
            <>
              <span className="donut-center-label">{active.label}</span>
              <span className="donut-center-value">{formatCurrency(active.total)}</span>
              <span className="donut-center-share">{formatPercent(active.share, 1)} of trip</span>
            </>
          ) : (
            <>
              <span className="donut-center-label">Trip total</span>
              <span className="donut-center-value">{formatCurrency(grandTotal)}</span>
              <span className="donut-center-share">10 days</span>
            </>
          )}
        </div>
      </div>

      <ul className="legend">
        {slices.map((slice) => {
          const isSelected = slice.key === selectedKey
          return (
            <li key={slice.key}>
              <button
                type="button"
                className="legend-item"
                data-state={isSelected ? 'selected' : 'idle'}
                aria-pressed={isSelected}
                onClick={() => select(slice.key)}
                onMouseEnter={() => setHoveredKey(slice.key)}
                onMouseLeave={() => setHoveredKey((current) => (current === slice.key ? null : current))}
                onFocus={() => setHoveredKey(slice.key)}
                onBlur={() => setHoveredKey((current) => (current === slice.key ? null : current))}
              >
                <span className="legend-swatch" style={{ backgroundColor: slice.color }} aria-hidden="true" />
                <span className="legend-label">{slice.label}</span>
                <span className="legend-figure">
                  <span className="legend-amount">{formatCurrency(slice.total)}</span>
                  <span className="legend-share">{formatPercent(slice.share, 1)}</span>
                </span>
              </button>
            </li>
          )
        })}
        <li className="legend-total">
          <span className="legend-total-label">Trip total</span>
          <span className="legend-total-value">{formatCurrency(grandTotal)}</span>
        </li>
      </ul>
    </div>
  )
}
