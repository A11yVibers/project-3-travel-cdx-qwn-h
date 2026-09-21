// Minimal RFC 4180 style CSV parser (handles quoted fields, escaped quotes, CRLF).
export function parseCsv(text) {
  const source = String(text).replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const meaningful = rows.filter((cells) => cells.some((cell) => cell.trim() !== ''))
  if (meaningful.length === 0) return []

  const [header, ...body] = meaningful
  const keys = header.map((name) => name.trim())

  return body.map((cells) => {
    const record = {}
    keys.forEach((key, index) => {
      record[key] = (cells[index] ?? '').trim()
    })
    return record
  })
}
