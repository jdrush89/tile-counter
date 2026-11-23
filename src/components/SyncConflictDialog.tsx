import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PendingConflict } from '@/hooks/use-account-sync'

function describe(value: unknown) {
  if (!value) return 'Deleted'
  const bundle = value as { tally: { title: string; count: number } | null; events: unknown[]; notes: unknown[] }
  if (!bundle.tally) return `Deleted tally (${bundle.events.length} history entries remain)`
  return `${bundle.tally.title}: ${bundle.tally.count} (${bundle.events.length} history entries, ${bundle.notes.length} notes)`
}

export function SyncConflictDialog({ conflict, resolve }: { conflict: PendingConflict; resolve: (choices: Record<string, 'local' | 'remote'>) => void }) {
  const [choices, setChoices] = useState<Record<string, 'local' | 'remote'>>({})
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose which changes to keep</DialogTitle>
          <DialogDescription>
            The same tally changed in two places. Choose a version for each tally; its history and notes will follow that version.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {conflict.conflicts.map(item => (
            <div key={item.id} className="space-y-2 rounded-lg border p-3">
              <p className="font-semibold">{item.label}</p>
              {(['local', 'remote'] as const).map(side => (
                <Button key={side} type="button" variant={choices[item.id] === side ? 'default' : 'outline'} className="w-full h-auto whitespace-normal justify-start text-left" aria-pressed={choices[item.id] === side} onClick={() => setChoices(current => ({ ...current, [item.id]: side }))}>
                  {side === 'local' ? 'Account on this device' : conflict.kind === 'guest' ? 'Guest data on this device' : 'Account on another device'}: {describe(item[side])}
                </Button>
              ))}
            </div>
          ))}
          <Button className="w-full" disabled={conflict.conflicts.some(item => !choices[item.id])} onClick={() => resolve(choices)}>Keep selected versions</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
