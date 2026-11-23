import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { EMPTY_ACCOUNT_DATA, mergeAccountData, type AccountData, type Tally } from './account-data.ts'

const tally = (id: string, count: number): Tally => ({ id, title: id, count, color: 'blue', animalType: 0 })
const data = (tallies: Tally[]): AccountData => ({ ...EMPTY_ACCOUNT_DATA, tallies })

test('merges independent tally changes from both devices', () => {
  const result = mergeAccountData(data([tally('a', 1), tally('b', 1)]), data([tally('a', 2), tally('b', 1)]), data([tally('a', 1), tally('b', 3)]))
  assert.deepEqual(result.data.tallies, [tally('a', 2), tally('b', 3)])
  assert.equal(result.conflicts.length, 0)
})

test('requires a choice for concurrent edits and deletions', () => {
  const base = data([tally('a', 1)])
  const local = data([tally('a', 2)])
  const remote = data([])
  assert.equal(mergeAccountData(base, local, remote).conflicts.length, 1)
  assert.deepEqual(mergeAccountData(base, local, remote, { a: 'local' }).data, local)
  assert.deepEqual(mergeAccountData(base, local, remote, { a: 'remote' }).data, remote)
})

test('keeps duplicate history entries together with their tally', () => {
  const local = data([tally('a', 2)])
  local.tallyEvents = [
    { tallyId: 'a', timestamp: 1, change: 1 },
    { tallyId: 'a', timestamp: 1, change: 1 },
  ]
  const result = mergeAccountData(EMPTY_ACCOUNT_DATA, local, EMPTY_ACCOUNT_DATA)
  assert.deepEqual(result.data.tallyEvents, local.tallyEvents)
})
