import Papa from 'papaparse'
import tripDaysCsv from '../../project-assets/trip_days.csv?raw'
import itineraryCsv from '../../project-assets/itinerary.csv?raw'
import expensesCsv from '../../project-assets/expenses.csv?raw'

function parseCsv(text) {
  const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true })
  if (result.errors.length > 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`)
  }
  return result.data
}

const dayRows = parseCsv(tripDaysCsv)
const itineraryRows = parseCsv(itineraryCsv)
const expenseRows = parseCsv(expensesCsv)

export const days = dayRows
  .map((row) => ({
    dayId: row.day_id,
    dayNumber: Number(row.day_number),
    date: row.date,
    city: row.city,
    country: row.country,
    landmark: row.iconic_landmark,
    imageUrl: row.landmark_image_url,
  }))
  .sort((a, b) => a.dayNumber - b.dayNumber)

export const itineraryByDay = days.reduce((acc, day) => {
  acc[day.dayId] = itineraryRows
    .filter((row) => row.day_id === day.dayId)
    .sort((a, b) => Number(a.item_order) - Number(b.item_order))
    .map((row) => ({ time: row.time, place: row.place, activity: row.activity }))
  return acc
}, {})

const expenses = expenseRows.map((row) => ({
  dayId: row.day_id,
  category: row.category.trim().toLowerCase(),
  subcategory: row.subcategory,
  description: row.description,
  amount: Number(row.amount_usd),
}))

export const CATEGORIES = Object.freeze([
  { key: 'lodging', label: 'Lodging', color: '#3e4a75' },
  { key: 'food', label: 'Food', color: '#b5502f' },
  { key: 'entertainment', label: 'Entertainment', color: '#a87615' },
  { key: 'travel', label: 'Travel', color: '#2e7268' },
])

function sumWhere(predicate) {
  return expenses.filter(predicate).reduce((sum, item) => sum + item.amount, 0)
}

export const categoryTotals = CATEGORIES.map((category) => ({
  ...category,
  total: sumWhere((item) => item.category === category.key),
}))

export const grandTotal = expenses.reduce((sum, item) => sum + item.amount, 0)

export function perDayTotals(categoryKey) {
  return days.map((day) => ({
    dayId: day.dayId,
    dayNumber: day.dayNumber,
    city: day.city,
    total: sumWhere((item) => item.dayId === day.dayId && item.category === categoryKey),
  }))
}

export function categoryPercent(amount) {
  if (!grandTotal) return 0
  return Math.round((amount / grandTotal) * 100)
}

export const tripMeta = {
  cityCount: days.length,
  countryCount: new Set(days.map((day) => day.country)).size,
  startCity: days[0]?.city ?? '',
  endCity: days[days.length - 1]?.city ?? '',
  startDate: days[0]?.date ?? '',
  endDate: days[days.length - 1]?.date ?? '',
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function toDateParts(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return { year, month, day }
}

export function formatShortDate(isoDate) {
  const { year, month, day } = toDateParts(isoDate)
  const weekday = new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short' })
  return `${weekday}, ${MONTHS[month - 1].slice(0, 3)} ${day}`
}

export function formatLongDate(isoDate) {
  const { year, month, day } = toDateParts(isoDate)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

export function formatDateRange(startIso, endIso) {
  const start = toDateParts(startIso)
  const end = toDateParts(endIso)
  if (start.year === end.year && start.month === end.month) {
    return `${MONTHS[start.month - 1]} ${start.day} – ${end.day}, ${end.year}`
  }
  return `${formatLongDate(startIso)} – ${formatLongDate(endIso)}`
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatUsd(amount) {
  return usdFormatter.format(amount)
}
