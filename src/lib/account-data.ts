export interface Tally {
  id: string
  title: string
  count: number
  color: string
  animalType: number
  goal?: number
}

export interface TallyEvent {
  tallyId: string
  timestamp: number
  change: number
  note?: string
}

export interface DailyTallyNote {
  date: string
  tallyId: string
  note: string
}

export interface AccountData {
  tallies: Tally[]
  tallyEvents: TallyEvent[]
  dailyTallyNotes: DailyTallyNote[]
}

export const EMPTY_ACCOUNT_DATA: AccountData = { tallies: [], tallyEvents: [], dailyTallyNotes: [] }

export interface SyncConflict {
  id: string
  label: string
  local: unknown
  remote: unknown
}

function same(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

interface TallyBundle {
  tally: Tally | null
  events: TallyEvent[]
  notes: DailyTallyNote[]
}

function groupByTally(data: AccountData) {
  const grouped = new Map<string, TallyBundle>()
  const get = (id: string) => {
    let group = grouped.get(id)
    if (!group) {
      group = { tally: null, events: [], notes: [] }
      grouped.set(id, group)
    }
    return group
  }
  data.tallies.forEach(tally => { get(tally.id).tally = tally })
  data.tallyEvents.forEach(event => { get(event.tallyId).events.push(event) })
  data.dailyTallyNotes.forEach(note => { get(note.tallyId).notes.push(note) })
  return grouped
}

export function mergeAccountData(
  base: AccountData,
  local: AccountData,
  remote: AccountData,
  choices: Record<string, 'local' | 'remote'> = {},
): { data: AccountData; conflicts: SyncConflict[] } {
  const data: AccountData = { tallies: [], tallyEvents: [], dailyTallyNotes: [] }
  const conflicts: SyncConflict[] = []
  const before = groupByTally(base)
  const here = groupByTally(local)
  const there = groupByTally(remote)
  for (const id of new Set([...before.keys(), ...here.keys(), ...there.keys()])) {
    const oldValue = before.get(id)
    const localValue = here.get(id)
    const remoteValue = there.get(id)
    let value: TallyBundle | undefined
    if (same(localValue, remoteValue) || same(remoteValue, oldValue)) value = localValue
    else if (same(localValue, oldValue)) value = remoteValue
    else {
      const selected = choices[id]
      if (!selected) {
        const title = localValue?.tally?.title ?? remoteValue?.tally?.title ?? oldValue?.tally?.title ?? id
        conflicts.push({ id, label: title, local: localValue ?? null, remote: remoteValue ?? null })
      }
      value = selected === 'remote' ? remoteValue : localValue
    }
    if (value) {
      if (value.tally) data.tallies.push(value.tally)
      data.tallyEvents.push(...value.events)
      data.dailyTallyNotes.push(...value.notes)
    }
  }
  return { data, conflicts }
}
