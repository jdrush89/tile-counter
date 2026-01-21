import { useState, useRef, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash, Minus, Check, PencilSimple, Lock, CurrencyDollar, Crown } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'sonner'

interface Tally {
  id: string
  title: string
  count: number
  color: string
  animalType: number
}

interface UserInfo {
  id: string
  login: string
  avatarUrl: string
  email: string
  isOwner: boolean
}

function useCurrentUser() {
  const [user, setUser] = useState<UserInfo | null>(null)
  
  useEffect(() => {
    spark.user().then(setUser)
  }, [])
  
  return user
}

const COLORS = [
  'oklch(0.65 0.2 250)',
  'oklch(0.65 0.2 150)',
  'oklch(0.65 0.2 30)',
  'oklch(0.65 0.2 330)',
  'oklch(0.65 0.2 200)',
  'oklch(0.65 0.2 80)',
]

const BASE_ANIMALS = [
  { id: 0, name: 'Dog', unlockAt: 0 },
  { id: 1, name: 'Cat', unlockAt: 0 },
  { id: 2, name: 'Bunny', unlockAt: 0 },
  { id: 3, name: 'Bird', unlockAt: 0 },
]

const UNLOCKABLE_ANIMALS = [
  { id: 4, name: 'Snake', unlockAt: 20 },
  { id: 5, name: 'Ostrich', unlockAt: 40 },
  { id: 6, name: 'Gorilla', unlockAt: 60 },
  { id: 7, name: 'Panther', unlockAt: 80 },
  { id: 8, name: 'Dragon', unlockAt: 100 },
]

const PREMIUM_ANIMALS = [
  { id: 9, name: 'Griffin', price: 2.99 },
]

const ALL_ANIMALS = [...BASE_ANIMALS, ...UNLOCKABLE_ANIMALS, ...PREMIUM_ANIMALS]

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

function RunningSnake({ legPhase }: { legPhase: number }) {
  const wave1 = Math.sin(legPhase) * 3
  const wave2 = Math.sin(legPhase + 1) * 3
  const wave3 = Math.sin(legPhase + 2) * 3
  const tongueFlick = Math.sin(legPhase * 3) * 2
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <path
        d={`M8 ${22 + wave1} Q16 ${18 + wave2} 24 ${22 + wave3} Q32 ${26 + wave1} 40 ${22 + wave2}`}
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="42" cy={21 + wave2} r="4" fill="white" fillOpacity="0.9" />
      <circle cx="40" cy={20 + wave2} r="1" fill="currentColor" fillOpacity="0.4" />
      <circle cx="44" cy={20 + wave2} r="1" fill="currentColor" fillOpacity="0.4" />
      <path
        d={`M46 ${22 + wave2} L${48 + tongueFlick} ${21 + wave2} M${47 + tongueFlick} ${21 + wave2} L${49 + tongueFlick} ${20 + wave2} M${47 + tongueFlick} ${21 + wave2} L${49 + tongueFlick} ${23 + wave2}`}
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <ellipse cx="6" cy={22 + wave1} rx="2" ry="1.5" fill="white" fillOpacity="0.8" />
    </svg>
  )
}

function RunningOstrich({ legPhase }: { legPhase: number }) {
  const frontLegAngle = Math.sin(legPhase) * 40
  const backLegAngle = Math.sin(legPhase + Math.PI) * 40
  const neckBob = Math.sin(legPhase * 2) * 2
  const wingFlutter = Math.sin(legPhase * 3) * 8
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <ellipse cx="20" cy="24" rx="10" ry="7" fill="white" fillOpacity="0.9" />
      <g transform={`rotate(${wingFlutter}, 20, 22)`}>
        <ellipse cx="18" cy="20" rx="6" ry="3" fill="white" fillOpacity="0.7" />
      </g>
      <path d={`M28 22 Q34 ${14 + neckBob} 38 ${10 + neckBob}`} stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      <circle cx="40" cy={8 + neckBob} r="4" fill="white" fillOpacity="0.9" />
      <circle cx="42" cy={7 + neckBob} r="1.2" fill="currentColor" fillOpacity="0.4" />
      <path d={`M44 ${9 + neckBob} L48 ${10 + neckBob}`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <g transform={`rotate(${frontLegAngle}, 24, 30)`}>
        <line x1="24" y1="30" x2="24" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${backLegAngle}, 16, 30)`}>
        <line x1="16" y1="30" x2="16" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function RunningGorilla({ legPhase }: { legPhase: number }) {
  const armSwing = Math.sin(legPhase) * 20
  const legSwing = Math.sin(legPhase + Math.PI) * 15
  const bodyBob = Math.abs(Math.sin(legPhase)) * 2
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <g transform={`translate(0, ${-bodyBob})`}>
        <ellipse cx="25" cy="20" rx="10" ry="8" fill="white" fillOpacity="0.9" />
        <circle cx="32" cy="14" r="6" fill="white" fillOpacity="0.9" />
        <ellipse cx="28" cy="12" rx="2" ry="2.5" fill="white" fillOpacity="0.7" />
        <ellipse cx="36" cy="12" rx="2" ry="2.5" fill="white" fillOpacity="0.7" />
        <circle cx="30" cy="14" r="1.2" fill="currentColor" fillOpacity="0.4" />
        <circle cx="34" cy="14" r="1.2" fill="currentColor" fillOpacity="0.4" />
        <ellipse cx="32" cy="17" rx="2.5" ry="1.5" fill="white" fillOpacity="0.6" />
        <g transform={`rotate(${armSwing}, 30, 22)`}>
          <path d="M30 22 Q36 28 38 36" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
          <circle cx="38" cy="37" r="2.5" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-armSwing}, 20, 22)`}>
          <path d="M20 22 Q14 28 12 36" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
          <circle cx="12" cy="37" r="2.5" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${legSwing}, 22, 28)`}>
          <line x1="22" y1="28" x2="20" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${-legSwing}, 28, 28)`}>
          <line x1="28" y1="28" x2="30" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}

function RunningPanther({ legPhase }: { legPhase: number }) {
  const frontLegAngle = Math.sin(legPhase) * 35
  const backLegAngle = Math.sin(legPhase + Math.PI) * 35
  const tailCurve = Math.sin(legPhase) * 10
  const bodyStretch = Math.sin(legPhase * 2) * 2
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <ellipse cx={25 + bodyStretch} cy="20" rx="14" ry="7" fill="white" fillOpacity="0.9" />
      <circle cx="40" cy="16" r="5" fill="white" fillOpacity="0.9" />
      <path d="M37 13 L35 8 L38 12" fill="white" fillOpacity="0.9" />
      <path d="M42 12 L44 7 L41 11" fill="white" fillOpacity="0.9" />
      <circle cx="38" cy="15" r="1" fill="currentColor" fillOpacity="0.4" />
      <circle cx="42" cy="15" r="1" fill="currentColor" fillOpacity="0.4" />
      <ellipse cx="40" cy="18" rx="1.5" ry="0.8" fill="white" fillOpacity="0.6" />
      <g transform={`rotate(${frontLegAngle}, 32, 24)`}>
        <line x1="32" y1="24" x2="32" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${frontLegAngle - 20}, 36, 24)`}>
        <line x1="36" y1="24" x2="36" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${backLegAngle}, 16, 24)`}>
        <line x1="16" y1="24" x2="16" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${backLegAngle - 20}, 20, 24)`}>
        <line x1="20" y1="24" x2="20" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d={`M11 18 Q${4 + tailCurve} 10 ${2 + tailCurve} 6`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

function RunningDragon({ legPhase }: { legPhase: number }) {
  const wingFlap = Math.sin(legPhase * 1.5) * 30
  const legSwing = Math.sin(legPhase) * 25
  const tailWave = Math.sin(legPhase + 1) * 8
  const fireFlicker = Math.sin(legPhase * 4) * 2
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <ellipse cx="24" cy="24" rx="12" ry="8" fill="white" fillOpacity="0.9" />
      <g transform={`rotate(${-wingFlap}, 24, 20)`}>
        <path d="M24 20 Q18 8 10 6 Q16 12 14 18 Q20 14 24 20" fill="white" fillOpacity="0.8" />
      </g>
      <g transform={`rotate(${wingFlap}, 24, 20)`}>
        <path d="M24 20 Q30 8 38 6 Q32 12 34 18 Q28 14 24 20" fill="white" fillOpacity="0.7" />
      </g>
      <circle cx="38" cy="20" r="5" fill="white" fillOpacity="0.9" />
      <path d="M36 16 L34 12 L37 15" fill="white" fillOpacity="0.9" />
      <path d="M40 15 L42 11 L40 15" fill="white" fillOpacity="0.9" />
      <circle cx="36" cy="19" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="40" cy="19" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <ellipse cx="38" cy="22" rx="1.5" ry="1" fill="white" fillOpacity="0.6" />
      <path
        d={`M43 21 L${46 + fireFlicker} 20 L${48 + fireFlicker} 21 L${46 + fireFlicker} 22 L43 21`}
        fill="white"
        fillOpacity="0.7"
      />
      <path d={`M12 24 Q${6 + tailWave} 22 ${4 + tailWave} 18`} stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d={`M${4 + tailWave} 18 L${2 + tailWave} 15 M${4 + tailWave} 18 L${6 + tailWave} 15 M${4 + tailWave} 18 L${4 + tailWave} 14`} stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <g transform={`rotate(${legSwing}, 28, 30)`}>
        <line x1="28" y1="30" x2="28" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${-legSwing}, 20, 30)`}>
        <line x1="20" y1="30" x2="20" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function RunningGriffin({ legPhase }: { legPhase: number }) {
  const wingFlap = Math.sin(legPhase * 1.5) * 35
  const frontLegAngle = Math.sin(legPhase) * 30
  const backLegAngle = Math.sin(legPhase + Math.PI) * 30
  const tailSwish = Math.sin(legPhase) * 10
  const headBob = Math.sin(legPhase * 2) * 2
  
  return (
    <svg viewBox="0 0 55 40" className="w-full h-full">
      <ellipse cx="24" cy="22" rx="13" ry="9" fill="white" fillOpacity="0.9" />
      <path d="M34 18 Q38 16 36 20" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      <g transform={`rotate(${-wingFlap}, 22, 18)`}>
        <path d="M22 18 Q14 6 6 4 Q10 10 8 14 Q12 12 14 16 Q18 12 22 18" fill="white" fillOpacity="0.85" />
        <path d="M8 14 Q4 10 2 12" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M14 16 Q10 14 8 16" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
      <g transform={`rotate(${wingFlap}, 26, 18)`}>
        <path d="M26 18 Q34 6 42 4 Q38 10 40 14 Q36 12 34 16 Q30 12 26 18" fill="white" fillOpacity="0.75" />
      </g>
      <g transform={`translate(0, ${headBob})`}>
        <ellipse cx="38" cy="16" rx="5" ry="4.5" fill="white" fillOpacity="0.9" />
        <path d="M42 16 L48 15 L42 18 Z" fill="white" fillOpacity="0.95" />
        <path d="M42 16.5 L46 16" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <circle cx="40" cy="15" r="1" fill="currentColor" fillOpacity="0.5" />
        <path d="M35 12 Q33 8 36 11" fill="white" fillOpacity="0.9" />
        <path d="M39 11 Q38 7 41 10" fill="white" fillOpacity="0.9" />
        <ellipse cx="36" cy="14" rx="1.5" ry="2" fill="white" fillOpacity="0.6" />
      </g>
      <g transform={`rotate(${frontLegAngle}, 30, 28)`}>
        <line x1="30" y1="28" x2="30" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 38 L28 39 M30 38 L32 39 M30 38 L30 40" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
      <g transform={`rotate(${frontLegAngle - 15}, 34, 28)`}>
        <line x1="34" y1="28" x2="34" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M34 38 L32 39 M34 38 L36 39 M34 38 L34 40" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
      <g transform={`rotate(${backLegAngle}, 14, 28)`}>
        <path d="M14 28 Q12 33 14 38" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="14" cy="39" rx="2" ry="1.5" fill="white" fillOpacity="0.9" />
      </g>
      <g transform={`rotate(${backLegAngle - 15}, 18, 28)`}>
        <path d="M18 28 Q16 33 18 38" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="18" cy="39" rx="2" ry="1.5" fill="white" fillOpacity="0.9" />
      </g>
      <path d={`M11 22 Q${6 + tailSwish} 22 ${4 + tailSwish} 26`} stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
      <ellipse cx={3 + tailSwish} cy="27" rx="3" ry="4" fill="white" fillOpacity="0.85" />
      <path d={`M${2 + tailSwish} 24 Q${0 + tailSwish} 22 ${1 + tailSwish} 25`} stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
      <path d={`M${4 + tailSwish} 24 Q${5 + tailSwish} 21 ${4 + tailSwish} 25`} stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
    </svg>
  )
}

function RunningAnimal({ variant, legPhase }: { variant: number; legPhase: number }) {
  switch (variant) {
    case 0:
      return <RunningDog legPhase={legPhase} />
    case 1:
      return <RunningCat legPhase={legPhase} />
    case 2:
      return <RunningBunny legPhase={legPhase} />
    case 3:
      return <RunningBird legPhase={legPhase} />
    case 4:
      return <RunningSnake legPhase={legPhase} />
    case 5:
      return <RunningOstrich legPhase={legPhase} />
    case 6:
      return <RunningGorilla legPhase={legPhase} />
    case 7:
      return <RunningPanther legPhase={legPhase} />
    case 8:
      return <RunningDragon legPhase={legPhase} />
    case 9:
      return <RunningGriffin legPhase={legPhase} />
    default:
      return <RunningDog legPhase={legPhase} />
  }
}

function PeekingAnimal({ variant, side }: { variant: number; side: 'left' | 'right' }) {
  const peekAmount = 12
  const isLargeAnimal = variant === 8 || variant === 9
  
  return (
    <div
      className={`absolute ${isLargeAnimal ? 'w-16 h-16 md:w-20 md:h-20' : 'w-10 h-10 md:w-12 md:h-12'}`}
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

function TileAnimal({ isAnimating, isHovered, animalIndex, totalAnimals, animalType }: { isAnimating: boolean; isHovered: boolean; animalIndex: number; totalAnimals: number; animalType: number }) {
  const [legPhase, setLegPhase] = useState(0)
  const [position, setPosition] = useState({ x: -20, y: 65 })
  const [direction, setDirection] = useState(1)
  const [idleState, setIdleState] = useState<IdleState>('hidden')
  const [peekSide, setPeekSide] = useState<'left' | 'right'>('left')
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const idleTimerRef = useRef<number | null>(null)
  const walkStartPosRef = useRef({ x: 0, y: 65 })
  const staggerDelay = animalIndex * 120

  const clearAnimations = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    startTimeRef.current = null
  }

  const speedUpRef = useRef(false)

  const speedUp = () => {
    speedUpRef.current = true
  }

  useEffect(() => {
    if (isHovered && idleState === 'walking') {
      speedUp()
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
      
      setTimeout(() => {
        setIdleState('running')
        const newDirection = Math.random() > 0.5 ? 1 : -1
        setDirection(newDirection)
        const yOffset = totalAnimals > 1 ? (animalIndex % 3) * 8 - 8 : 0
        const startX = newDirection === 1 ? -25 : 125
        const targetX = newDirection === 1 ? 125 : -25
        setPosition({ x: startX, y: 65 + yOffset })
        startTimeRef.current = null
        
        const animate = (timestamp: number) => {
          if (!startTimeRef.current) startTimeRef.current = timestamp
          const elapsed = timestamp - startTimeRef.current
          
          const phase = elapsed * 0.025
          setLegPhase(phase)
          
          const progress = Math.min(elapsed / 1200, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          
          const newX = startX + (targetX - startX) * eased
          const bounce = Math.sin(phase * 2) * 2
          setPosition({ x: newX, y: 65 + yOffset + bounce })
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate)
          } else {
            setIdleState('hidden')
          }
        }
        
        animationRef.current = requestAnimationFrame(animate)
      }, staggerDelay)
    }
  }, [isAnimating, staggerDelay, animalIndex, totalAnimals])

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
          const startX = walkDir === 1 ? -25 : 125
          walkStartPosRef.current = { x: startX, y: 65 }
          setPosition({ x: startX, y: 65 })
          setIdleState('walking')
          startTimeRef.current = null
          speedUpRef.current = false
          
          let currentSpeed = 1
          let currentX = startX
          const targetX = walkDir === 1 ? 125 : -25
          const totalDistance = Math.abs(targetX - startX)
          let lastTimestamp: number | null = null
          
          const animateWalk = (timestamp: number) => {
            if (!lastTimestamp) lastTimestamp = timestamp
            const deltaTime = timestamp - lastTimestamp
            lastTimestamp = timestamp
            
            if (speedUpRef.current && currentSpeed < 8) {
              currentSpeed = Math.min(currentSpeed + deltaTime * 0.02, 8)
            }
            
            const baseSpeed = totalDistance / 6000
            const actualSpeed = baseSpeed * currentSpeed * deltaTime
            
            if (walkDir === 1) {
              currentX += actualSpeed
            } else {
              currentX -= actualSpeed
            }
            
            const legSpeed = speedUpRef.current ? 0.025 : 0.008
            const phase = (timestamp * legSpeed)
            setLegPhase(phase)
            
            const bounce = Math.sin(phase * 2) * (speedUpRef.current ? 2 : 1)
            setPosition({ x: currentX, y: 65 + bounce })
            
            const reachedEnd = walkDir === 1 ? currentX >= targetX : currentX <= targetX
            
            if (!reachedEnd) {
              animationRef.current = requestAnimationFrame(animateWalk)
            } else {
              setIdleState('hidden')
              speedUpRef.current = false
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
        <PeekingAnimal variant={animalType} side={peekSide} />
      </motion.div>
    )
  }

  if (idleState === 'hidden') return null

  const isLargeAnimal = animalType === 8 || animalType === 9
  
  return (
    <motion.div
      className={`absolute pointer-events-none ${isLargeAnimal ? 'w-24 h-24 md:w-28 md:h-28' : 'w-14 h-14 md:w-18 md:h-18'}`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: `translateX(-50%) translateY(-50%) scaleX(${direction})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.95 }}
      exit={{ opacity: 0 }}
    >
      <RunningAnimal variant={animalType} legPhase={legPhase} />
    </motion.div>
  )
}

function TallyTile({ 
  tally, 
  isAnimating,
  animatingCount,
  onIncrement, 
  onStartLongPress, 
  onCancelLongPress,
  onOpenEdit 
}: { 
  tally: Tally
  isAnimating: boolean
  animatingCount: number
  onIncrement: () => void
  onStartLongPress: () => void
  onCancelLongPress: () => void
  onOpenEdit: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const maxAnimals = Math.min(animatingCount, 20)
  const animalType = tally.animalType ?? 0
  
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
        {isAnimating ? (
          Array.from({ length: maxAnimals }).map((_, i) => (
            <TileAnimal 
              key={i} 
              isAnimating={isAnimating} 
              isHovered={isHovered} 
              animalIndex={i}
              totalAnimals={maxAnimals}
              animalType={animalType}
            />
          ))
        ) : (
          <TileAnimal isAnimating={false} isHovered={isHovered} animalIndex={0} totalAnimals={1} animalType={animalType} />
        )}
        <CardContent className="h-full flex flex-col items-center justify-center p-4">
          <motion.span
            key={tally.count}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-bold text-white drop-shadow-sm"
          >
            {tally.count}
          </motion.span>
          <span 
            className="font-medium text-white/90 mt-2 w-full text-center break-words px-1 leading-tight"
            style={{
              fontSize: tally.title.length > 40 ? '0.65rem' : tally.title.length > 25 ? '0.75rem' : tally.title.length > 15 ? '0.85rem' : '0.875rem',
            }}
          >
            {tally.title}
          </span>
        </CardContent>
      </Card>
    </motion.button>
  )
}

function TallyApp({ user }: { user: UserInfo }) {
  const [tallies, setTallies] = useKV<Tally[]>(`tallies-${user.id}`, [])
  const [purchasedAnimals, setPurchasedAnimals] = useKV<number[]>(`purchased-animals-${user.id}`, [])
  const [newTitle, setNewTitle] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [animatingCount, setAnimatingCount] = useState(0)
  const longPressTimerRef = useRef<number | null>(null)
  const isLongPressRef = useRef(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [animalToPurchase, setAnimalToPurchase] = useState<{ id: number; name: string; price: number } | null>(null)

  const currentTallies = tallies ?? []
  const currentPurchased = purchasedAnimals ?? []
  const [showNewButton, setShowNewButton] = useState(false)
  
  const totalTallies = useMemo(() => 
    currentTallies.reduce((sum, t) => sum + t.count, 0),
    [currentTallies]
  )
  
  const isAnimalAvailable = (animal: typeof ALL_ANIMALS[number]) => {
    if ('price' in animal) {
      return currentPurchased.includes(animal.id)
    }
    return animal.unlockAt <= totalTallies
  }
  
  const nextUnlock = useMemo(() => 
    UNLOCKABLE_ANIMALS.find(a => a.unlockAt > totalTallies),
    [totalTallies]
  )

  useEffect(() => {
    if (tallies !== undefined) {
      setIsLoaded(true)
      const timer = setTimeout(() => {
        setShowNewButton(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [tallies])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 animate-pulse" />
          <p className="text-muted-foreground">Loading your tallies...</p>
        </div>
      </div>
    )
  }

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
    const animalType = Math.floor(Math.random() * 4)
    setTallies((current) => [
      ...(current ?? []),
      { id: Date.now().toString(), title: newTitle.trim(), count: 0, color, animalType }
    ])
    setNewTitle('')
    setDialogOpen(false)
  }

  const incrementTally = (id: string) => {
    const currentTally = currentTallies.find(t => t.id === id)
    const newCount = currentTally ? currentTally.count + 1 : 1
    
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === id ? { ...t, count: t.count + 1 } : t))
    )
    setAnimatingId(id)
    setAnimatingCount(newCount)
    
    const maxAnimals = Math.min(newCount, 20)
    const lastAnimalStaggerDelay = (maxAnimals - 1) * 120
    const animationDuration = 1200
    const totalAnimationTime = lastAnimalStaggerDelay + animationDuration + 100
    
    setTimeout(() => {
      setAnimatingId(null)
      setAnimatingCount(0)
    }, totalAnimationTime)
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

  const updateTallyColor = (id: string, color: string) => {
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === id ? { ...t, color } : t))
    )
  }

  const updateTallyAnimal = (id: string, animalType: number) => {
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === id ? { ...t, animalType } : t))
    )
  }

  const handleAnimalSelect = (tallyId: string, animalId: number) => {
    const animal = ALL_ANIMALS.find(a => a.id === animalId)
    if (!animal) return
    
    if ('price' in animal && !currentPurchased.includes(animalId)) {
      setAnimalToPurchase(animal as { id: number; name: string; price: number })
      setPurchaseDialogOpen(true)
      return
    }
    
    updateTallyAnimal(tallyId, animalId)
  }

  const handlePurchase = () => {
    if (!animalToPurchase) return
    
    setPurchasedAnimals((current) => [...(current ?? []), animalToPurchase.id])
    toast.success(`${animalToPurchase.name} purchased!`, {
      description: 'You can now use this animal on any tally tile.',
    })
    setPurchaseDialogOpen(false)
    setAnimalToPurchase(null)
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
          <div className="flex items-center justify-center gap-2 pt-1">
            <img 
              src={user.avatarUrl} 
              alt={user.login}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-muted-foreground">{user.login}'s tallies</span>
          </div>
          {nextUnlock && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/70 rounded-full text-sm">
                <Lock size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalTallies}</span>
                  <span className="mx-1">/</span>
                  <span>{nextUnlock.unlockAt}</span>
                  <span className="ml-1.5">to unlock</span>
                  <span className="ml-1 font-medium text-foreground">{nextUnlock.name}</span>
                </span>
              </div>
            </div>
          )}
          {!nextUnlock && totalTallies >= 100 && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full text-sm">
                <span className="text-accent-foreground font-medium">
                  🎉 All animals unlocked! Total: {totalTallies}
                </span>
              </div>
            </div>
          )}
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
                  <Card className="aspect-square border-2 border-primary/50 bg-card overflow-hidden">
                    <CardContent className="h-full overflow-y-auto p-3 md:p-4">
                      <div className="flex flex-col items-center gap-2 md:gap-3 min-h-full justify-between">
                        <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full">
                          <Input
                            id={`count-input-${tally.id}`}
                            type="number"
                            min="0"
                            value={tally.count}
                            onChange={(e) => {
                              const newCount = Math.max(0, parseInt(e.target.value) || 0)
                              setTallies((current) =>
                                (current ?? []).map((t) => (t.id === tally.id ? { ...t, count: newCount } : t))
                              )
                            }}
                            className="w-20 h-9 text-2xl md:text-3xl font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          
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
                                className="h-7 text-xs"
                                autoFocus
                              />
                              <Button
                                type="submit"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                              >
                                <Check size={12} weight="bold" />
                              </Button>
                            </form>
                          ) : (
                            <button
                              onClick={() => setIsEditingName(true)}
                              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors text-center"
                            >
                              <span className="line-clamp-2 break-words">{tally.title}</span>
                              <PencilSimple size={12} className="shrink-0" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 md:gap-3 w-full">
                          <div className="flex justify-center gap-1 md:gap-1.5 flex-wrap">
                            {COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateTallyColor(tally.id, color)}
                                className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-all ${tally.color === color ? 'ring-2 ring-offset-1 md:ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>

                          <div className="flex justify-center">
                            <Select
                              value={String(tally.animalType ?? 0)}
                              onValueChange={(value) => handleAnimalSelect(tally.id, Number(value))}
                            >
                              <SelectTrigger className="w-full max-w-[140px] md:max-w-[160px] h-7 md:h-8 text-xs">
                                <SelectValue placeholder="Select animal" />
                              </SelectTrigger>
                              <SelectContent>
                                {ALL_ANIMALS.map((animal) => {
                                  const isPremium = 'price' in animal
                                  const isUnlocked = isPremium 
                                    ? currentPurchased.includes(animal.id)
                                    : animal.unlockAt <= totalTallies
                                  return (
                                    <SelectItem
                                      key={animal.id}
                                      value={String(animal.id)}
                                      className="text-xs"
                                    >
                                      <span className="flex items-center gap-2">
                                        {isUnlocked ? (
                                          <span className="flex items-center gap-1.5">
                                            {isPremium && <Crown size={12} className="text-amber-500" weight="fill" />}
                                            {animal.name}
                                          </span>
                                        ) : isPremium ? (
                                          <span className="flex items-center gap-1.5 text-amber-600">
                                            <CurrencyDollar size={12} weight="bold" />
                                            {animal.name} (${(animal as { price: number }).price})
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Lock size={12} />
                                            {animal.name} ({animal.unlockAt})
                                          </span>
                                        )}
                                      </span>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => decrementTally(tally.id)}
                              className="h-8 w-8 md:h-9 md:w-9"
                            >
                              <Minus size={14} weight="bold" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteTally(tally.id)}
                              className="h-8 w-8 md:h-9 md:w-9"
                            >
                              <Trash size={14} weight="bold" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={closeEditMode}
                            className="text-xs h-6 md:h-7"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <TallyTile
                    tally={tally}
                    isAnimating={animatingId === tally.id}
                    animatingCount={animatingId === tally.id ? animatingCount : 0}
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

          {showNewButton && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
          )}
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

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown size={20} className="text-amber-500" weight="fill" />
              Premium Animal
            </DialogTitle>
            <DialogDescription>
              Unlock this exclusive animal to use on your tallies.
            </DialogDescription>
          </DialogHeader>
          {animalToPurchase && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-center">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'oklch(0.65 0.2 280)' }}
                >
                  <div className="w-20 h-20">
                    <RunningAnimal variant={animalToPurchase.id} legPhase={0} />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold">{animalToPurchase.name}</h3>
                <p className="text-2xl font-bold text-primary">${animalToPurchase.price.toFixed(2)}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPurchaseDialogOpen(false)
                    setAnimalToPurchase(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePurchase}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                >
                  <CurrencyDollar size={16} weight="bold" className="mr-1" />
                  Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function App() {
  const user = useCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 animate-pulse" />
          <p className="text-muted-foreground">Loading your tallies...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <TallyApp user={user} />
      <Toaster position="top-center" />
    </>
  )
}

export default App
