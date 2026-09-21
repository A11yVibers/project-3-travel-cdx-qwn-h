import { useEffect, useRef, useState } from 'react'

const pad2 = (value) => String(value).padStart(2, '0')

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function JourneyFlow({ days, selectedDayId, onSelect, panelId }) {
  const scrollerRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const [brokenImages, setBrokenImages] = useState(() => new Set())
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return undefined

    const measure = () => setScrollable(scroller.scrollWidth - scroller.clientWidth > 4)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    const node = nodeRefs.current.get(selectedDayId)
    if (!scroller || !node || scroller.scrollWidth <= scroller.clientWidth) return

    const scrollerBox = scroller.getBoundingClientRect()
    const nodeBox = node.getBoundingClientRect()
    const delta = nodeBox.left - scrollerBox.left - (scroller.clientWidth - nodeBox.width) / 2

    scroller.scrollTo({
      left: Math.max(0, scroller.scrollLeft + delta),
      behavior: reducedMotion() ? 'auto' : 'smooth',
    })
  }, [selectedDayId])

  const markBroken = (dayId) => {
    setBrokenImages((current) => {
      if (current.has(dayId)) return current
      const next = new Set(current)
      next.add(dayId)
      return next
    })
  }

  return (
    <div className="route-block">
      <div className="route-wrap" ref={scrollerRef}>
        <ol className="route">
          {days.map((day) => {
            const isSelected = day.dayId === selectedDayId
            const initials = day.city
              .split(/[\s-]+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0].toUpperCase())
              .join('')

            return (
              <li className="stop" key={day.dayId}>
                <button
                  type="button"
                  className="stop-button"
                  ref={(element) => {
                    if (element) nodeRefs.current.set(day.dayId, element)
                    else nodeRefs.current.delete(day.dayId)
                  }}
                  aria-pressed={isSelected}
                  aria-controls={panelId}
                  onClick={() => onSelect(day.dayId)}
                >
                  <span className="stop-frame" aria-hidden="true">
                    <span className="stop-frame-inner">
                      {brokenImages.has(day.dayId) ? (
                        <span className="stop-monogram">{initials}</span>
                      ) : (
                        <img
                          src={day.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={() => markBroken(day.dayId)}
                        />
                      )}
                    </span>
                  </span>
                  <span className="stop-meta">
                    <span className="stop-day">Day {pad2(day.dayNumber)}</span>
                    <span className="stop-city">{day.city}</span>
                    <span className="stop-date">
                      {day.weekdayShort} · {day.monthShort} {day.dayOfMonth}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
      {scrollable ? (
        <p className="route-hint" aria-hidden="true">
          Scroll for the rest of the route →
        </p>
      ) : null}
    </div>
  )
}
