import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { applyHistoryEdits, moveTimestampToDate, type HistoryEdits } from './history.ts'
import type { Tally, TallyEvent } from './account-data.ts'

const tally: Tally = { id: 'a', title: 'Coffee', count: 7, color: 'blue', animalType: 0 }
const timestamp = new Date(2026, 0, 15, 14, 23, 45, 123).getTime()
const first: TallyEvent = { tallyId: 'a', timestamp, change: 2, note: 'first' }
const second: TallyEvent = { tallyId: 'a', timestamp, change: 5, note: 'second' }

const edits = (entries: HistoryEdits['entries']): HistoryEdits => ({
  sourceDate: '2026-01-15', entries, originalDailyNotes: { a: 'Original' }, dailyNotes: { a: 'Original' },
})

test('moving an entry preserves its local time, count, and appends the daily note', () => {
  const result = applyHistoryEdits([tally], [first, second], [
    { tallyId: 'a', date: '2026-01-15', note: 'Original' },
    { tallyId: 'a', date: '2026-02-20', note: 'Existing' },
  ], edits([
    { original: first, note: 'first', change: 2, deleted: false, destinationDate: '2026-02-20' },
    { original: second, note: 'second', change: 5, deleted: false },
  ]))
  const moved = new Date(result.events[0].timestamp)
  assert.deepEqual([moved.getFullYear(), moved.getMonth(), moved.getDate(), moved.getHours(), moved.getMinutes(), moved.getSeconds(), moved.getMilliseconds()], [2026, 1, 20, 14, 23, 45, 123])
  assert.equal(result.events[1].timestamp, timestamp)
  assert.equal(result.tallies[0].count, 7)
  assert.deepEqual(result.dailyNotes, [{ tallyId: 'a', date: '2026-02-20', note: 'Existing\n\nOriginal' }])
})

test('moves a group without conflating identical timestamps and applies other edits', () => {
  const result = applyHistoryEdits([tally], [first, second], [], {
    ...edits([
      { original: first, note: 'edited', change: 0, deleted: false, destinationDate: '2026-03-08' },
      { original: second, note: 'second', change: 5, deleted: false, destinationDate: '2026-03-08' },
    ]),
    originalDailyNotes: { a: '' }, dailyNotes: { a: '' },
  })
  assert.equal(result.tallies[0].count, 5)
  assert.deepEqual(result.events.map(event => [event.note, event.change]), [['edited', 0], ['second', 5]])
  assert.ok(result.events.every(event => new Date(event.timestamp).getDate() === 8))
})

test('rejects invalid dates and stale edits without changing data', () => {
  assert.throws(() => moveTimestampToDate(timestamp, '2026-02-30'), /valid destination/)
  assert.throws(() => applyHistoryEdits([tally], [{ ...first, change: 3 }], [], edits([
    { original: first, note: 'first', change: 2, deleted: false, destinationDate: '2026-02-20' },
  ])), /History changed/)
  assert.equal(tally.count, 7)
})

test('does not overwrite a changed source summary note', () => {
  assert.throws(() => applyHistoryEdits([tally], [first], [{ tallyId: 'a', date: '2026-01-15', note: 'Changed elsewhere' }], edits([
    { original: first, note: 'first', change: 2, deleted: false, destinationDate: '2026-02-20' },
  ])), /summary note changed/)
})

test('rejects a destination where the local time is skipped by daylight saving', () => {
  const previous = process.env.TZ
  process.env.TZ = 'America/New_York'
  try {
    const before = new Date(2026, 2, 7, 2, 30).getTime()
    assert.throws(() => moveTimestampToDate(before, '2026-03-08'), /clock change/)
  } finally {
    if (previous === undefined) delete process.env.TZ
    else process.env.TZ = previous
  }
})

test('preserves unedited note formatting while moving an entry', () => {
  const entry = { ...first, note: '  entry note  ' }
  const result = applyHistoryEdits([tally], [entry], [{ tallyId: 'a', date: '2026-01-15', note: '  summary  ' }], {
    ...edits([{ original: entry, note: entry.note, change: 2, deleted: false, destinationDate: '2026-02-20' }]),
    originalDailyNotes: { a: '  summary  ' },
    dailyNotes: { a: '  summary  ' },
  })
  assert.equal(result.events[0].note, '  entry note  ')
  assert.equal(result.dailyNotes[0].note, '  summary  ')
})

test('deletes only the selected entry when timestamps collide', () => {
  const result = applyHistoryEdits([tally], [first, second], [], {
    ...edits([
      { original: first, note: 'first', change: 2, deleted: true },
      { original: second, note: 'second', change: 5, deleted: false, destinationDate: '2026-02-20' },
    ]),
    originalDailyNotes: { a: '' }, dailyNotes: { a: '' },
  })
  assert.equal(result.tallies[0].count, 5)
  assert.equal(result.events.length, 1)
  assert.equal(result.events[0].note, 'second')
  assert.equal(new Date(result.events[0].timestamp).getMonth(), 1)
})
