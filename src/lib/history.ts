import type { DailyTallyNote, Tally, TallyEvent } from './account-data'

export interface HistoryEntryEdit {
  original: TallyEvent
  note: string
  change: number
  deleted: boolean
  destinationDate?: string
}

export interface HistoryEdits {
  sourceDate: string
  entries: HistoryEntryEdit[]
  originalDailyNotes: Record<string, string>
  dailyNotes: Record<string, string>
}

function eventKey(event: TallyEvent) {
  return JSON.stringify([event.tallyId, event.timestamp, event.change, event.note ?? ''])
}

export function moveTimestampToDate(timestamp: number, date: string): number {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!parts) throw new Error('Choose a valid destination date.')
  const year = Number(parts[1])
  const month = Number(parts[2]) - 1
  const day = Number(parts[3])
  const original = new Date(timestamp)
  const moved = new Date(timestamp)
  moved.setFullYear(year, month, day)
  if (!year || !Number.isFinite(moved.getTime()) || moved.getFullYear() !== year || moved.getMonth() !== month || moved.getDate() !== day) {
    throw new Error('Choose a valid destination date.')
  }
  if (moved.getHours() !== original.getHours() || moved.getMinutes() !== original.getMinutes()) {
    throw new Error("This entry's time does not exist on the selected day because of a clock change.")
  }
  return moved.getTime()
}

export function applyHistoryEdits(
  tallies: Tally[],
  events: TallyEvent[],
  dailyNotes: DailyTallyNote[],
  edits: HistoryEdits,
): { tallies: Tally[]; events: TallyEvent[]; dailyNotes: DailyTallyNote[] } {
  const available = new Map<string, number[]>()
  events.forEach((event, index) => {
    const key = eventKey(event)
    available.set(key, [...(available.get(key) ?? []), index])
  })

  const replacements = new Map<number, TallyEvent | null>()
  const countChanges = new Map<string, number>()
  const destinations = new Map<string, Set<string>>()
  for (const edit of edits.entries) {
    if (!Number.isSafeInteger(edit.change)) throw new Error('Entry amounts must be whole numbers.')
    const index = available.get(eventKey(edit.original))?.shift()
    if (index === undefined) throw new Error('History changed while you were editing. Reopen this day and try again.')
    const event = events[index]
    if (edit.deleted) {
      replacements.set(index, null)
      countChanges.set(event.tallyId, (countChanges.get(event.tallyId) ?? 0) - event.change)
      continue
    }
    const destination = edit.destinationDate
    const timestamp = destination && destination !== edits.sourceDate
      ? moveTimestampToDate(event.timestamp, destination)
      : event.timestamp
    if (destination && destination !== edits.sourceDate) {
      const dates = destinations.get(event.tallyId) ?? new Set<string>()
      dates.add(destination)
      destinations.set(event.tallyId, dates)
    }
    const note = edit.note === (event.note ?? '') ? event.note : edit.note.trim() || undefined
    replacements.set(index, { ...event, timestamp, change: edit.change, note })
    countChanges.set(event.tallyId, (countChanges.get(event.tallyId) ?? 0) + edit.change - event.change)
  }

  let nextNotes = [...dailyNotes]
  for (const [tallyId, editedNote] of Object.entries(edits.dailyNotes)) {
    const original = edits.originalDailyNotes[tallyId] ?? ''
    const sourceNotes = nextNotes.filter(note => note.tallyId === tallyId && note.date === edits.sourceDate)
    const current = sourceNotes[0]?.note ?? ''
    const movedTo = destinations.get(tallyId)
    if ((editedNote !== original || movedTo?.size) && sourceNotes.length > 1) {
      throw new Error('This day has duplicate summary notes. Resolve them before moving entries.')
    }
    if ((editedNote !== original || movedTo?.size) && current !== original) {
      throw new Error('A daily summary note changed while you were editing. Reopen this day and try again.')
    }
    if (editedNote === original && !movedTo?.size) continue
    const note = editedNote === original ? original : editedNote.trim()
    nextNotes = nextNotes.filter(item => !(item.tallyId === tallyId && item.date === edits.sourceDate))
    if (movedTo?.size) {
      if (note.trim()) {
        for (const date of movedTo) {
          const existing = nextNotes.find(item => item.tallyId === tallyId && item.date === date)
          if (existing) {
            nextNotes = nextNotes.map(item => item === existing ? { ...item, note: `${item.note}\n\n${note}` } : item)
          } else {
            nextNotes.push({ tallyId, date, note })
          }
        }
      }
    } else if (note.trim()) {
      nextNotes.push({ tallyId, date: edits.sourceDate, note })
    }
  }

  return {
    tallies: tallies.map(tally => ({ ...tally, count: tally.count + (countChanges.get(tally.id) ?? 0) })),
    events: events.flatMap((event, index) => {
      if (!replacements.has(index)) return [event]
      const replacement = replacements.get(index)
      return replacement ? [replacement] : []
    }),
    dailyNotes: nextNotes,
  }
}
