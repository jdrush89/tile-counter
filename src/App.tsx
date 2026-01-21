import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash, Minus, Check, PencilSimple } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Tally {
  id: string
  title: string
  count: number
  color: string
}

const COLORS = [
  'oklch(0.65 0.2 250)',
  'oklch(0.65 0.2 150)',
  'oklch(0.65 0.2 30)',
  'oklch(0.65 0.2 330)',
  'oklch(0.65 0.2 200)',
  'oklch(0.65 0.2 80)',
]

function App() {
  const [tallies, setTallies] = useKV<Tally[]>('user-tallies', [])
  const [newTitle, setNewTitle] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const longPressTimerRef = useRef<number | null>(null)
  const isLongPressRef = useRef(false)

  const currentTallies = tallies ?? []

  const startLongPress = (id: string) => {
    isLongPressRef.current = false
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true
      const tally = currentTallies.find(t => t.id === id)
      if (tally) {
        setEditingTitle(tally.title)
      }
      setEditingId(id)
    }, 500)
  }

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleClick = (id: string) => {
    if (!isLongPressRef.current) {
      incrementTally(id)
    }
    isLongPressRef.current = false
  }

  const addTally = () => {
    if (!newTitle.trim()) return
    const color = COLORS[currentTallies.length % COLORS.length]
    setTallies((current) => [
      ...(current ?? []),
      { id: Date.now().toString(), title: newTitle.trim(), count: 0, color }
    ])
    setNewTitle('')
    setDialogOpen(false)
  }

  const incrementTally = (id: string) => {
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === id ? { ...t, count: t.count + 1 } : t))
    )
  }

  const decrementTally = (id: string) => {
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === id ? { ...t, count: Math.max(0, t.count - 1) } : t))
    )
  }

  const updateTallyTitle = (id: string, newTitleValue: string) => {
    if (!newTitleValue.trim()) return
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === id ? { ...t, title: newTitleValue.trim() } : t))
    )
    setIsEditingName(false)
  }

  const deleteTally = (id: string) => {
    setTallies((current) => (current ?? []).filter((t) => t.id !== id))
    setEditingId(null)
    setIsEditingName(false)
  }

  const closeEditMode = () => {
    setEditingId(null)
    setIsEditingName(false)
    setEditingTitle('')
  }

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.5 0.1 250) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="relative max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2 py-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Tally
          </h1>
          <p className="text-muted-foreground">
            Tap to count. Long press to edit.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {currentTallies.map((tally) => (
              <motion.div
                key={tally.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {editingId === tally.id ? (
                  <Card className="aspect-square border-2 border-primary/50 bg-card">
                    <CardContent className="h-full flex flex-col items-center justify-center gap-2 p-3">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        {tally.count}
                      </span>
                      
                      {isEditingName ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault()
                            updateTallyTitle(tally.id, editingTitle)
                          }}
                          className="flex gap-1 w-full"
                        >
                          <Input
                            id="edit-title"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            type="submit"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                          >
                            <Check size={14} weight="bold" />
                          </Button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="truncate max-w-[100px]">{tally.title}</span>
                          <PencilSimple size={14} />
                        </button>
                      )}
                      
                      <div className="flex gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => decrementTally(tally.id)}
                          className="h-10 w-10"
                        >
                          <Minus size={18} weight="bold" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteTally(tally.id)}
                          className="h-10 w-10"
                        >
                          <Trash size={18} weight="bold" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeEditMode}
                        className="text-xs mt-1"
                      >
                        Done
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClick(tally.id)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      const t = currentTallies.find(item => item.id === tally.id)
                      if (t) setEditingTitle(t.title)
                      setEditingId(tally.id)
                    }}
                    onTouchStart={() => startLongPress(tally.id)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onMouseDown={() => startLongPress(tally.id)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
                  >
                    <Card 
                      className="aspect-square cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-0 overflow-hidden"
                      style={{ backgroundColor: tally.color }}
                    >
                      <CardContent className="h-full flex flex-col items-center justify-center p-4">
                        <motion.span
                          key={tally.count}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-5xl md:text-6xl font-bold text-white drop-shadow-sm"
                        >
                          {tally.count}
                        </motion.span>
                        <span className="text-sm md:text-base font-medium text-white/90 mt-2 truncate w-full text-center">
                          {tally.title}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
              >
                <Card className="aspect-square border-2 border-dashed border-muted-foreground/30 bg-transparent hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="h-full flex flex-col items-center justify-center gap-2 p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus size={28} weight="bold" className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      New Tally
                    </span>
                  </CardContent>
                </Card>
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Tally</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  addTally()
                }}
                className="space-y-4 pt-4"
              >
                <Input
                  id="tally-title"
                  placeholder="e.g. Movies watched, Coffees, Pushups..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newTitle.trim()}>
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {currentTallies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Create your first tally to start counting!
            </p>
          </div>
        )}

        <footer className="text-center text-xs text-muted-foreground pb-8 pt-8">
          Right-click or long-press a tile to edit or delete
        </footer>
      </div>
    </div>
  )
}

export default App
