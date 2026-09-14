import { parseCsv } from './csv.js'
import tripDaysCsv from '../../project-assets/trip_days.csv?raw'
import itineraryCsv from '../../project-assets/itinerary.csv?raw'
import expensesCsv from '../../project-assets/expenses.csv?raw'

export const currency0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatDate(isoDate, options) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', options)
}

export const days = parseCsv(tripDaysCsv)
  .map((r) => ({
    dayId: r.day_id,
    dayNumber: Number(r.day_number),
    date: r.date,
    city: r.city,
    country: r.country,
    landmark: r.iconic_landmark,
    imageUrl: r.landmark_image_url,
  }))
  .sort((a, b) => a.dayNumber - b.dayNumber)
  .map((day) => ({
    ...day,
    dateLabel: formatDate(day.date, { weekday: 'short', month: 'short', day: 'numeric' }),
    fullDateLabel: formatDate(day.date, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }))

export const itineraryByDayId = new Map()
for (const r of parseCsv(itineraryCsv)) {
  const list = itineraryByDayId.get(r.day_id) ?? []
  list.push({
    order: Number(r.item_order),
    time: r.time,
    place: r.place,
    activity: r.activity,
  })
  itineraryByDayId.set(r.day_id, list)
}
for (const list of itineraryByDayId.values()) {
  list.sort((a, b) => a.order - b.order)
}

const expenses = parseCsv(expensesCsv).map((r) => ({
  dayId: r.day_id,
  category: r.category.toLowerCase(),
  amount: Number(r.amount_usd),
}))

export const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

export const CATEGORIES = [
  { key: 'lodging', label: 'Lodging', color: '#c2703d' },
  { key: 'food', label: 'Food', color: '#7f9455' },
  { key: 'entertainment', label: 'Entertainment', color: '#81679b' },
  { key: 'travel', label: 'Travel', color: '#487f92' },
]

export const categoryStats = CATEGORIES.map((cat) => {
  const rows = expenses.filter((e) => e.category === cat.key)
  const total = rows.reduce((sum, e) => sum + e.amount, 0)
  const daily = days.map((day) => ({
    dayNumber: day.dayNumber,
    city: day.city,
    dateLabel: day.dateLabel,
    amount: rows
      .filter((e) => e.dayId === day.dayId)
      .reduce((sum, e) => sum + e.amount, 0),
  }))
  return {
    ...cat,
    total,
    share: grandTotal > 0 ? total / grandTotal : 0,
    daily,
  }
})

export const tripStats = {
  cityCount: new Set(days.map((d) => d.city)).size,
  countryCount: new Set(days.map((d) => d.country)).size,
}
