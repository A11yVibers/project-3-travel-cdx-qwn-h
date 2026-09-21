import expensesCsv from '../../project-assets/expenses.csv?raw'
import itineraryCsv from '../../project-assets/itinerary.csv?raw'
import tripDaysCsv from '../../project-assets/trip_days.csv?raw'
import { parseCsv } from './csv.js'

// The four categories requested for the expense chart, in display order.
export const EXPENSE_CATEGORIES = Object.freeze([
  { key: 'lodging', label: 'Lodging', color: '#7aa7cf' },
  { key: 'food', label: 'Food', color: '#e5a75c' },
  { key: 'entertainment', label: 'Entertainment', color: '#cf86b4' },
  { key: 'travel', label: 'Travel', color: '#7cbda1' },
])

const byNumber = (field) => (a, b) => Number(a[field]) - Number(b[field])

function toDateParts(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekdayShort = date.toLocaleDateString('en-US', { weekday: 'short' })
  const weekdayLong = date.toLocaleDateString('en-US', { weekday: 'long' })
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' })
  const longMonthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return { year, month, dayOfMonth: day, dateValue: date, weekdayShort, weekdayLong, monthShort, longMonthDay }
}

function groupByDayId(rows) {
  const grouped = new Map()
  for (const row of rows) {
    const list = grouped.get(row.day_id)
    if (list) list.push(row)
    else grouped.set(row.day_id, [row])
  }
  return grouped
}

// Pure derivation so the numbers can be checked independently of the bundler.
export function buildTripData({ tripDays, itinerary, expenses }) {
  const itineraryByDay = groupByDayId(itinerary)
  const expensesByDay = groupByDayId(expenses)

  const days = tripDays
    .map((row) => ({
      dayId: row.day_id,
      dayNumber: Number(row.day_number),
      date: row.date,
      city: row.city,
      country: row.country,
      landmark: row.iconic_landmark,
      imageUrl: row.landmark_image_url,
    }))
    .sort(byNumber('dayNumber'))
    .map((day) => {
      const schedule = (itineraryByDay.get(day.dayId) ?? [])
        .slice()
        .sort(byNumber('item_order'))
        .map((item) => ({
          order: Number(item.item_order),
          time: item.time,
          place: item.place,
          activity: item.activity,
        }))

      const dayExpenses = (expensesByDay.get(day.dayId) ?? [])
        .slice()
        .sort(byNumber('expense_order'))
        .map((item) => ({
          order: Number(item.expense_order),
          category: item.category,
          subcategory: item.subcategory,
          description: item.description,
          amount: Number(item.amount_usd),
        }))

      return {
        ...day,
        ...toDateParts(day.date),
        itinerary: schedule,
        expenses: dayExpenses,
        dayTotal: dayExpenses.reduce((sum, item) => sum + item.amount, 0),
      }
    })

  const amountFor = (dayId, categoryKey) =>
    days
      .find((day) => day.dayId === dayId)
      ?.expenses.filter((item) => item.category === categoryKey)
      .reduce((sum, item) => sum + item.amount, 0) ?? 0

  const grandTotal = days.reduce((sum, day) => sum + day.dayTotal, 0)

  const categories = EXPENSE_CATEGORIES.map((category) => {
    const byDay = days.map((day) => ({
      dayId: day.dayId,
      dayNumber: day.dayNumber,
      city: day.city,
      country: day.country,
      amount: amountFor(day.dayId, category.key),
    }))
    const total = byDay.reduce((sum, entry) => sum + entry.amount, 0)
    const peak = byDay.reduce(
      (best, entry) => (entry.amount > best.amount ? entry : best),
      byDay[0] ?? { amount: 0, city: '—', dayNumber: 0 },
    )

    return {
      ...category,
      total,
      share: grandTotal > 0 ? total / grandTotal : 0,
      byDay,
      average: byDay.length > 0 ? total / byDay.length : 0,
      peak,
    }
  })

  const summary = {
    dayCount: days.length,
    cityCount: new Set(days.map((day) => day.city)).size,
    countryCount: new Set(days.map((day) => day.country)).size,
    grandTotal,
    dailyAverage: days.length > 0 ? grandTotal / days.length : 0,
    startDate: days[0]?.date ?? '',
    endDate: days[days.length - 1]?.date ?? '',
    firstCity: days[0]?.city ?? '',
    lastCity: days[days.length - 1]?.city ?? '',
  }

  return { days, categories, summary }
}

export const TRIP = buildTripData({
  tripDays: parseCsv(tripDaysCsv),
  itinerary: parseCsv(itineraryCsv),
  expenses: parseCsv(expensesCsv),
})

const currency0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const formatCurrency = (value) => currency0.format(Math.round(value))

export const formatPercent = (value, digits = 0) =>
  `${(value * 100).toFixed(digits)}%`
