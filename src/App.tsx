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

function RunningDog({ legPhase }: { legPhase: number }) {
  const frontLegAngle = Math.sin(legPhase) * 35
  const backLegAngle = Math.sin(legPhase + Math.PI) * 35
  const tailWag = Math.sin(legPhase * 2) * 15
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <ellipse cx="25" cy="20" rx="14" ry="9" fill="white" fillOpacity="0.9" />
      <circle cx="38" cy="15" r="7" fill="white" fillOpacity="0.9" />
      <ellipse cx="41" cy="14" rx="2.5" ry="3" fill="white" />
      <circle cx="40" cy="13" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <ellipse cx="43" cy="16" rx="2" ry="1.5" fill="white" fillOpacity="0.7" />
      <path d="M35 9 Q38 4 36 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M38 8 Q42 3 40 7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g transform={`rotate(${frontLegAngle}, 30, 26)`}>
        <line x1="30" y1="26" x2="30" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${frontLegAngle - 20}, 34, 26)`}>
        <line x1="34" y1="26" x2="34" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${backLegAngle}, 16, 26)`}>
        <line x1="16" y1="26" x2="16" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${backLegAngle - 20}, 20, 26)`}>
        <line x1="20" y1="26" x2="20" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${tailWag}, 11, 18)`}>
        <path d="M11 18 Q4 12 6 18" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function RunningCat({ legPhase }: { legPhase: number }) {
  const frontLegAngle = Math.sin(legPhase) * 30
  const backLegAngle = Math.sin(legPhase + Math.PI) * 30
  const tailCurve = Math.sin(legPhase) * 8
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <ellipse cx="25" cy="22" rx="12" ry="8" fill="white" fillOpacity="0.9" />
      <circle cx="38" cy="16" r="6" fill="white" fillOpacity="0.9" />
      <path d="M33 12 L31 6 L35 11" fill="white" fillOpacity="0.9" />
      <path d="M41 10 L43 4 L38 9" fill="white" fillOpacity="0.9" />
      <circle cx="36" cy="15" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="40" cy="15" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <ellipse cx="38" cy="18" rx="1.5" ry="1" fill="white" fillOpacity="0.6" />
      <line x1="42" y1="16" x2="48" y2="14" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="42" y1="18" x2="48" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="34" y1="16" x2="28" y2="14" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="34" y1="18" x2="28" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <g transform={`rotate(${frontLegAngle}, 30, 28)`}>
        <line x1="30" y1="28" x2="30" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${frontLegAngle - 15}, 33, 28)`}>
        <line x1="33" y1="28" x2="33" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${backLegAngle}, 17, 28)`}>
        <line x1="17" y1="28" x2="17" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${backLegAngle - 15}, 20, 28)`}>
        <line x1="20" y1="28" x2="20" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d={`M13 20 Q${5 + tailCurve} 10 ${8 + tailCurve} 6`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function RunningBunny({ legPhase }: { legPhase: number }) {
  const hop = Math.abs(Math.sin(legPhase)) * 4
  const earWiggle = Math.sin(legPhase * 2) * 8
  const legKick = Math.sin(legPhase) * 25
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <g transform={`translate(0, ${-hop})`}>
        <ellipse cx="22" cy="26" rx="10" ry="8" fill="white" fillOpacity="0.9" />
        <circle cx="34" cy="20" r="6" fill="white" fillOpacity="0.9" />
        <g transform={`rotate(${earWiggle - 10}, 32, 20)`}>
          <ellipse cx="30" cy="8" rx="2.5" ry="8" fill="white" fillOpacity="0.9" />
          <ellipse cx="30" cy="8" rx="1.2" ry="5" fill="currentColor" fillOpacity="0.15" />
        </g>
        <g transform={`rotate(${-earWiggle + 10}, 36, 20)`}>
          <ellipse cx="38" cy="8" rx="2.5" ry="8" fill="white" fillOpacity="0.9" />
          <ellipse cx="38" cy="8" rx="1.2" ry="5" fill="currentColor" fillOpacity="0.15" />
        </g>
        <circle cx="32" cy="19" r="1.2" fill="currentColor" fillOpacity="0.4" />
        <circle cx="37" cy="19" r="1.2" fill="currentColor" fillOpacity="0.4" />
        <ellipse cx="34.5" cy="22" rx="1.5" ry="1" fill="white" fillOpacity="0.6" />
        <circle cx="12" cy="26" r="4" fill="white" fillOpacity="0.9" />
        <g transform={`rotate(${legKick}, 28, 32)`}>
          <ellipse cx="28" cy="36" rx="2" ry="3" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-legKick}, 18, 32)`}>
          <ellipse cx="16" cy="36" rx="3" ry="2.5" fill="white" fillOpacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

function RunningBird({ legPhase }: { legPhase: number }) {
  const wingFlap = Math.sin(legPhase * 2) * 25
  const bob = Math.sin(legPhase) * 2
  const legMove = Math.sin(legPhase) * 20
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <g transform={`translate(0, ${bob})`}>
        <ellipse cx="25" cy="24" rx="10" ry="8" fill="white" fillOpacity="0.9" />
        <circle cx="36" cy="18" r="6" fill="white" fillOpacity="0.9" />
        <path d="M40 17 L48 16 L40 19 Z" fill="white" fillOpacity="0.8" />
        <circle cx="38" cy="16" r="1.5" fill="currentColor" fillOpacity="0.4" />
        <g transform={`rotate(${-wingFlap}, 25, 20)`}>
          <ellipse cx="20" cy="14" rx="8" ry="4" fill="white" fillOpacity="0.85" />
        </g>
        <g transform={`rotate(${wingFlap}, 25, 20)`}>
          <ellipse cx="28" cy="14" rx="8" ry="4" fill="white" fillOpacity="0.7" />
        </g>
        <path d="M15 26 Q10 24 12 28" fill="white" fillOpacity="0.8" />
        <path d="M14 27 Q8 26 11 30" fill="white" fillOpacity="0.7" />
        <path d="M16 28 Q12 28 14 31" fill="white" fillOpacity="0.6" />
        <g transform={`rotate(${legMove}, 24, 30)`}>
          <line x1="24" y1="30" x2="22" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 38 L19 39 M22 38 L21 40" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${-legMove}, 28, 30)`}>
          <line x1="28" y1="30" x2="26" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M26 38 L23 39 M26 38 L25 40" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}

function RunningAnimal({ variant, legPhase }: { variant: number; legPhase: number }) {
  switch (variant % 4) {
    case 0:
      return <RunningDog legPhase={legPhase} />
    case 1:
      return <RunningCat legPhase={legPhase} />
    case 2:
      return <RunningBunny legPhase={legPhase} />
    case 3:
    default:
      return <RunningBird legPhase={legPhase} />
  }
}

function PeekingAnimal({ variant, side }: { variant: number; side: 'left' | 'right' }) {
  const peekAmount = 12
  
  return (
    <div
      className="absolute w-10 h-10 md:w-12 md:h-12"
      style={{
        top: '60%',
        left: side === 'left' ? `-${peekAmount}%` : 'auto',
        right: side === 'right' ? `-${peekAmount}%` : 'auto',
        transform: `translateY(-50%) scaleX(${side === 'left' ? 1 : -1})`,
      }}
    >
      <RunningAnimal variant={variant} legPhase={0} />
    </div>
  )
}

type IdleState = 'hidden' | 'peeking' | 'walking' | 'running'

function TileAnimal({ isAnimating, isHovered }: { isAnimating: boolean; isHovered: boolean }) {
  const [animalVariant] = useState(() => Math.floor(Math.random() * 4))
  const [legPhase, setLegPhase] = useState(0)
  const [position, setPosition] = useState({ x: -20, y: 65 })
  const [direction, setDirection] = useState(1)
  const [idleState, setIdleState] = useState<IdleState>('hidden')
  const [peekSide, setPeekSide] = useState<'left' | 'right'>('left')
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const idleTimerRef = useRef<number | null>(null)
  const walkStartPosRef = useRef({ x: 0, y: 65 })

  const clearAnimations = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    startTimeRef.current = null
  }

  const runAway = () => {
    clearAnimations()
    setIdleState('running')
    startTimeRef.current = null
    
    const exitDirection = position.x < 50 ? -1 : 1
    setDirection(-exitDirection)
    const startX = position.x
    const targetX = exitDirection === 1 ? 120 : -20
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      
      const phase = elapsed * 0.04
      setLegPhase(phase)
      
      const progress = Math.min(elapsed / 400, 1)
      const eased = progress * progress
      
      const newX = startX + (targetX - startX) * eased
      const bounce = Math.sin(phase * 2) * 2
      setPosition({ x: newX, y: 65 + bounce })
      
      if (elapsed < 400) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIdleState('hidden')
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (isHovered && idleState === 'walking') {
      runAway()
    } else if (isHovered && idleState === 'peeking') {
      setIdleState('hidden')
    }
  }, [isHovered, idleState])

  useEffect(() => {
    if (isAnimating) {
      clearAnimations()
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
      
      setIdleState('running')
      const newDirection = Math.random() > 0.5 ? 1 : -1
      setDirection(newDirection)
      setPosition({ x: newDirection === 1 ? -15 : 115, y: 65 })
      startTimeRef.current = null
      
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const elapsed = timestamp - startTimeRef.current
        
        const phase = elapsed * 0.025
        setLegPhase(phase)
        
        const progress = Math.min(elapsed / 1000, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        
        const startX = newDirection === 1 ? -15 : 115
        const targetX = newDirection === 1 ? 115 : -15
        const newX = startX + (targetX - startX) * eased
        const bounce = Math.sin(phase * 2) * 2
        setPosition({ x: newX, y: 65 + bounce })
        
        if (elapsed < 1000) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIdleState('hidden')
        }
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [isAnimating])

  useEffect(() => {
    if (idleState !== 'hidden' && idleState !== 'peeking') return
    
    const scheduleIdleAction = () => {
      const delay = 3000 + Math.random() * 8000
      
      idleTimerRef.current = window.setTimeout(() => {
        if (isAnimating || isHovered) {
          scheduleIdleAction()
          return
        }
        
        const action = Math.random()
        
        if (action < 0.5) {
          const side = Math.random() > 0.5 ? 'left' : 'right'
          setPeekSide(side)
          setIdleState('peeking')
          
          setTimeout(() => {
            setIdleState('hidden')
            scheduleIdleAction()
          }, 2000 + Math.random() * 2000)
        } else {
          const walkDir = Math.random() > 0.5 ? 1 : -1
          setDirection(walkDir)
          const startX = walkDir === 1 ? -10 : 110
          walkStartPosRef.current = { x: startX, y: 65 }
          setPosition({ x: startX, y: 65 })
          setIdleState('walking')
          startTimeRef.current = null
          
          const animateWalk = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp
            const elapsed = timestamp - startTimeRef.current
            
            const phase = elapsed * 0.008
            setLegPhase(phase)
            
            const progress = Math.min(elapsed / 6000, 1)
            
            const startXPos = walkStartPosRef.current.x
            const targetX = walkDir === 1 ? 110 : -10
            const newX = startXPos + (targetX - startXPos) * progress
            const bounce = Math.sin(phase * 2) * 1
            setPosition({ x: newX, y: 65 + bounce })
            
            if (elapsed < 6000) {
              animationRef.current = requestAnimationFrame(animateWalk)
            } else {
              setIdleState('hidden')
              scheduleIdleAction()
            }
          }
          
          animationRef.current = requestAnimationFrame(animateWalk)
        }
      }, delay)
    }
    
    if (idleState === 'hidden') {
      scheduleIdleAction()
    }
    
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [idleState, isAnimating, isHovered])

  useEffect(() => {
    return () => {
      clearAnimations()
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [])

  if (idleState === 'peeking') {
    return (
      <motion.div
        initial={{ opacity: 0, x: peekSide === 'left' ? -10 : 10 }}
        animate={{ opacity: 0.9, x: 0 }}
        exit={{ opacity: 0, x: peekSide === 'left' ? -10 : 10 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none overflow-visible"
      >
        <PeekingAnimal variant={animalVariant} side={peekSide} />
      </motion.div>
    )
  }

  if (idleState === 'hidden') return null

  return (
    <motion.div
      className="absolute w-14 h-14 md:w-18 md:h-18 pointer-events-none"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: `translateX(-50%) translateY(-50%) scaleX(${direction})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.95 }}
      exit={{ opacity: 0 }}
    >
      <RunningAnimal variant={animalVariant} legPhase={legPhase} />
    </motion.div>
  )
}

function TallyTile({ 
  tally, 
  isAnimating, 
  onIncrement, 
  onStartLongPress, 
  onCancelLongPress,
  onOpenEdit 
}: { 
  tally: Tally
  isAnimating: boolean
  onIncrement: () => void
  onStartLongPress: () => void
  onCancelLongPress: () => void
  onOpenEdit: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onIncrement}
      onContextMenu={(e) => {
        e.preventDefault()
        onOpenEdit()
      }}
      onTouchStart={onStartLongPress}
      onTouchEnd={onCancelLongPress}
      onTouchMove={onCancelLongPress}
      onMouseDown={onStartLongPress}
      onMouseUp={onCancelLongPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        onCancelLongPress()
      }}
      className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <Card 
        className="aspect-square cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-0 overflow-hidden relative"
        style={{ backgroundColor: tally.color }}
      >
        <TileAnimal isAnimating={isAnimating} isHovered={isHovered} />
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
  )
}

function App() {
  const [tallies, setTallies] = useKV<Tally[]>('user-tallies', [])
  const [newTitle, setNewTitle] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [animatingId, setAnimatingId] = useState<string | null>(null)
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
    setAnimatingId(id)
    setTimeout(() => setAnimatingId(null), 1000)
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
                  <TallyTile
                    tally={tally}
                    isAnimating={animatingId === tally.id}
                    onIncrement={() => handleClick(tally.id)}
                    onStartLongPress={() => startLongPress(tally.id)}
                    onCancelLongPress={cancelLongPress}
                    onOpenEdit={() => {
                      const t = currentTallies.find(item => item.id === tally.id)
                      if (t) setEditingTitle(t.title)
                      setEditingId(tally.id)
                    }}
                  />
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
