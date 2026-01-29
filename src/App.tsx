import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash, Minus, Check, PencilSimple, Lock, CurrencyDollar, Crown, Megaphone, PersonSimpleTaiChi, CalendarBlank, CaretLeft, CaretRight, X, NotePencil, Trophy, CaretDown, CaretUp } from '@phosphor-icons/react'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'

interface TallyEvent {
  tallyId: string
  timestamp: number
  change: number
  note?: string
}

interface DailyTallyNote {
  date: string
  tallyId: string
  note: string
}

interface Tally {
  id: string
  title: string
  count: number
  color: string
  animalType: number
  goal?: number
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
  { id: 11, name: 'Banana', unlockAt: 0 },
  { id: 12, name: 'Squirrel', unlockAt: 0 },
]

const UNLOCKABLE_ANIMALS = [
  { id: 17, name: 'Alligator', unlockAt: 10 },
  { id: 4, name: 'Snake', unlockAt: 20 },
  { id: 5, name: 'Ostrich', unlockAt: 40 },
  { id: 6, name: 'Gorilla', unlockAt: 60 },
  { id: 7, name: 'Panther', unlockAt: 80 },
  { id: 8, name: 'Dragon', unlockAt: 100 },
]

const PREMIUM_ANIMALS = [
  { id: 9, name: 'Griffin', price: 2.99 },
  { id: 10, name: 'Cthulhu', price: 3.99 },
  { id: 13, name: 'Sasquatch', price: 4.99 },
  { id: 14, name: 'Lizard King', price: 5.99 },
  { id: 15, name: 'Zombie', price: 3.49 },
  { id: 16, name: 'T-Rex', price: 4.49 },
  { id: 18, name: 'Anglerfish', price: 3.99 },
  { id: 19, name: 'Shark', price: 3.99 },
  { id: 20, name: 'Whale', price: 100 },
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
      <circle cx="40" cy="13" r="1.5" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
      <circle cx="36" cy="15" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
      <circle cx="40" cy="15" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
          <ellipse cx="30" cy="8" rx="1.2" ry="5" fill="oklch(0.7 0.1 0)" fillOpacity="0.3" />
        </g>
        <g transform={`rotate(${-earWiggle + 10}, 36, 20)`}>
          <ellipse cx="38" cy="8" rx="2.5" ry="8" fill="white" fillOpacity="0.9" />
          <ellipse cx="38" cy="8" rx="1.2" ry="5" fill="oklch(0.7 0.1 0)" fillOpacity="0.3" />
        </g>
        <circle cx="32" cy="19" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <circle cx="37" cy="19" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
        <circle cx="38" cy="16" r="1.5" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
      <circle cx="40" cy={20 + wave2} r="1" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
      <circle cx="44" cy={20 + wave2} r="1" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
      <circle cx="42" cy={7 + neckBob} r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
        <circle cx="30" cy="14" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <circle cx="34" cy="14" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
      <circle cx="38" cy="15" r="1" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
      <circle cx="42" cy="15" r="1" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
      <circle cx="36" cy="19" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
      <circle cx="40" cy="19" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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
    <svg viewBox="-10 0 65 45" className="w-full h-full">
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
        <circle cx="40" cy="15" r="1" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
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

function RunningCthulhu({ legPhase }: { legPhase: number }) {
  const tentacleWave1 = Math.sin(legPhase) * 8
  const tentacleWave2 = Math.sin(legPhase + 0.5) * 8
  const tentacleWave3 = Math.sin(legPhase + 1) * 8
  const tentacleWave4 = Math.sin(legPhase + 1.5) * 8
  const wingFlap = Math.sin(legPhase * 1.2) * 20
  const legSwing = Math.sin(legPhase) * 25
  const bodyBob = Math.sin(legPhase * 2) * 2
  
  return (
    <svg viewBox="0 0 55 45" className="w-full h-full">
      <g transform={`translate(0, ${bodyBob})`}>
        <ellipse cx="26" cy="20" rx="12" ry="10" fill="white" fillOpacity="0.9" />
        <g transform={`rotate(${-wingFlap}, 26, 16)`}>
          <path d="M26 16 Q18 4 8 2 Q14 8 12 14 Q18 10 22 14 Q24 10 26 16" fill="white" fillOpacity="0.75" />
          <path d="M12 14 Q8 10 6 12" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
        <g transform={`rotate(${wingFlap}, 26, 16)`}>
          <path d="M26 16 Q34 4 44 2 Q38 8 40 14 Q34 10 30 14 Q28 10 26 16" fill="white" fillOpacity="0.7" />
          <path d="M40 14 Q44 10 46 12" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
        <ellipse cx="26" cy="14" rx="8" ry="7" fill="white" fillOpacity="0.9" />
        <circle cx="22" cy="12" r="2.5" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="30" cy="12" r="2.5" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="22" cy="12" r="1" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <circle cx="30" cy="12" r="1" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <path d={`M22 18 Q${20 + tentacleWave1} 28 ${18 + tentacleWave1} 38`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d={`M25 19 Q${24 + tentacleWave2} 30 ${22 + tentacleWave2} 40`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d={`M27 19 Q${28 + tentacleWave3} 30 ${30 + tentacleWave3} 40`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d={`M30 18 Q${32 + tentacleWave4} 28 ${34 + tentacleWave4} 38`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d={`M20 17 Q${16 + tentacleWave2 * 0.5} 22 ${14 + tentacleWave2 * 0.5} 28`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d={`M32 17 Q${36 + tentacleWave3 * 0.5} 22 ${38 + tentacleWave3 * 0.5} 28`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <g transform={`rotate(${legSwing}, 20, 28)`}>
          <line x1="20" y1="28" x2="18" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="17" cy="41" rx="2.5" ry="1.5" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-legSwing}, 32, 28)`}>
          <line x1="32" y1="28" x2="34" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="35" cy="41" rx="2.5" ry="1.5" fill="white" fillOpacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

function RunningBanana({ legPhase }: { legPhase: number }) {
  const armSwing = Math.sin(legPhase) * 25
  const legSwing = Math.sin(legPhase + Math.PI) * 30
  const bodyBob = Math.abs(Math.sin(legPhase)) * 2
  const lean = Math.sin(legPhase * 2) * 3
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <g transform={`translate(0, ${-bodyBob}) rotate(${lean}, 25, 20)`}>
        <path
          d="M20 8 Q14 12 12 20 Q11 28 16 34 Q20 36 24 35 Q28 34 30 30 Q34 22 32 14 Q30 8 26 6 Q22 5 20 8"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M22 6 Q24 4 26 5"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        <ellipse cx="18" cy="16" rx="1.5" ry="2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <ellipse cx="26" cy="14" rx="1.5" ry="2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <path
          d="M20 22 Q22 24 24 22"
          stroke="oklch(0.25 0 0)"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`rotate(${armSwing}, 14, 18)`}>
          <line x1="14" y1="18" x2="6" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="5" cy="23" r="2" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-armSwing}, 30, 16)`}>
          <line x1="30" y1="16" x2="38" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="39" cy="21" r="2" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${legSwing}, 18, 32)`}>
          <line x1="18" y1="32" x2="14" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="13" cy="41" rx="2.5" ry="1.5" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-legSwing}, 24, 34)`}>
          <line x1="24" y1="34" x2="28" y2="42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="29" cy="43" rx="2.5" ry="1.5" fill="white" fillOpacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

function RunningSquirrel({ legPhase }: { legPhase: number }) {
  const frontLegAngle = Math.sin(legPhase) * 35
  const backLegAngle = Math.sin(legPhase + Math.PI) * 35
  const tailWave = Math.sin(legPhase * 0.8) * 10
  const bodyBob = Math.abs(Math.sin(legPhase)) * 2
  
  return (
    <svg viewBox="0 0 50 40" className="w-full h-full">
      <g transform={`translate(0, ${-bodyBob})`}>
        <path 
          d={`M14 20 Q${10 + tailWave} 12 ${8 + tailWave} 6 Q${10 + tailWave} 2 ${14 + tailWave} 4 Q${18 + tailWave} 8 16 18`}
          fill="white" 
          fillOpacity="0.9"
        />
        <ellipse cx="22" cy="22" rx="10" ry="7" fill="white" fillOpacity="0.9" />
        <circle cx="34" cy="18" r="5" fill="white" fillOpacity="0.9" />
        <ellipse cx="31" cy="14" rx="2" ry="3" fill="white" fillOpacity="0.9" />
        <ellipse cx="37" cy="14" rx="2" ry="3" fill="white" fillOpacity="0.9" />
        <circle cx="32" cy="17" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <circle cx="36" cy="17" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <ellipse cx="34" cy="20" rx="1.5" ry="1" fill="white" fillOpacity="0.6" />
        <ellipse cx="38" cy="19" rx="1" ry="1.5" fill="white" fillOpacity="0.7" />
        <g transform={`rotate(${frontLegAngle}, 28, 26)`}>
          <line x1="28" y1="26" x2="28" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${frontLegAngle - 15}, 31, 26)`}>
          <line x1="31" y1="26" x2="31" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${backLegAngle}, 14, 26)`}>
          <line x1="14" y1="26" x2="14" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${backLegAngle - 15}, 17, 26)`}>
          <line x1="17" y1="26" x2="17" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}

function RunningSasquatch({ legPhase }: { legPhase: number }) {
  const armSwing = Math.sin(legPhase) * 25
  const legSwing = Math.sin(legPhase + Math.PI) * 30
  const bodyBob = Math.abs(Math.sin(legPhase)) * 3
  const shoulderRoll = Math.sin(legPhase * 2) * 3
  
  return (
    <svg viewBox="0 0 55 45" className="w-full h-full">
      <g transform={`translate(0, ${-bodyBob})`}>
        <ellipse cx="27" cy="22" rx="14" ry="12" fill="white" fillOpacity="0.9" />
        <path d="M18 16 Q16 12 14 14 Q12 18 16 20" fill="white" fillOpacity="0.85" />
        <path d="M36 16 Q38 12 40 14 Q42 18 38 20" fill="white" fillOpacity="0.85" />
        <ellipse cx="27" cy="14" rx="9" ry="8" fill="white" fillOpacity="0.9" />
        <ellipse cx="27" cy="10" rx="5" ry="3" fill="white" fillOpacity="0.85" />
        <path d="M21 10 Q19 6 22 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M33 10 Q35 6 32 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <circle cx="23" cy="13" r="1.8" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <circle cx="31" cy="13" r="1.8" fill="oklch(0.25 0 0)" fillOpacity="0.7" />
        <ellipse cx="27" cy="17" rx="3" ry="2" fill="white" fillOpacity="0.6" />
        <circle cx="26" cy="16.5" r="0.6" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="28" cy="16.5" r="0.6" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <path d="M24 20 Q27 22 30 20" stroke="oklch(0.25 0 0)" strokeOpacity="0.5" strokeWidth="1" fill="none" strokeLinecap="round" />
        <g transform={`rotate(${armSwing + shoulderRoll}, 18, 20)`}>
          <path d="M18 20 Q12 28 8 36" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="7" cy="37" rx="3" ry="2.5" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-armSwing - shoulderRoll}, 36, 20)`}>
          <path d="M36 20 Q42 28 46 36" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="47" cy="37" rx="3" ry="2.5" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${legSwing}, 22, 32)`}>
          <path d="M22 32 Q20 38 18 44" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="17" cy="45" rx="4" ry="2" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-legSwing}, 32, 32)`}>
          <path d="M32 32 Q34 38 36 44" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="37" cy="45" rx="4" ry="2" fill="white" fillOpacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

function RunningLizardKing({ legPhase }: { legPhase: number }) {
  const legSwing = Math.sin(legPhase) * 25
  const armSwing = Math.sin(legPhase + Math.PI * 0.5) * 20
  const tailWave = Math.sin(legPhase * 0.8) * 12
  const bodyBob = Math.abs(Math.sin(legPhase)) * 2
  const jawOpen = Math.abs(Math.sin(legPhase * 2)) * 3
  const spineWiggle = Math.sin(legPhase * 1.5) * 2
  
  return (
    <svg viewBox="-10 0 70 50" className="w-full h-full">
      <g transform={`translate(0, ${-bodyBob})`}>
        <path 
          d={`M8 28 Q${4 + tailWave} 26 ${2 + tailWave * 0.8} 22 Q${0 + tailWave * 0.6} 18 ${-2 + tailWave * 0.4} 14`}
          stroke="white" 
          strokeWidth="5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M${-2 + tailWave * 0.4} 14 L${-4 + tailWave * 0.3} 10 M${-2 + tailWave * 0.4} 14 L${0 + tailWave * 0.3} 10`}
          stroke="white" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
        <ellipse cx="22" cy="26" rx="16" ry="12" fill="white" fillOpacity="0.9" />
        <path d={`M12 ${16 + spineWiggle} L14 ${12 + spineWiggle} L16 ${16 + spineWiggle}`} fill="white" fillOpacity="0.9" />
        <path d={`M18 ${14 + spineWiggle * 0.8} L20 ${9 + spineWiggle * 0.8} L22 ${14 + spineWiggle * 0.8}`} fill="white" fillOpacity="0.9" />
        <path d={`M24 ${14 + spineWiggle * 0.6} L26 ${10 + spineWiggle * 0.6} L28 ${14 + spineWiggle * 0.6}`} fill="white" fillOpacity="0.9" />
        <path d={`M30 ${16 + spineWiggle * 0.4} L32 ${12 + spineWiggle * 0.4} L34 ${16 + spineWiggle * 0.4}`} fill="white" fillOpacity="0.9" />
        <ellipse cx="40" cy="22" rx="10" ry="9" fill="white" fillOpacity="0.9" />
        <path d="M38 14 L36 8 L40 13" fill="white" fillOpacity="0.85" />
        <path d="M44 14 L46 8 L42 13" fill="white" fillOpacity="0.85" />
        <circle cx="36" cy="20" r="2.5" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="44" cy="20" r="2.5" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="36" cy="20" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <circle cx="44" cy="20" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <ellipse cx="40" cy="24" rx="3" ry="2" fill="white" fillOpacity="0.6" />
        <circle cx="39" cy="23.5" r="0.5" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="41" cy="23.5" r="0.5" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <path 
          d={`M48 ${26 + jawOpen} Q52 ${28 + jawOpen} 56 ${26 + jawOpen * 0.5}`}
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M48 ${24 - jawOpen * 0.5} Q52 ${22 - jawOpen * 0.5} 56 ${24}`}
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M50 ${25 + jawOpen * 0.3} L51 ${27 + jawOpen * 0.5} M53 ${25 + jawOpen * 0.2} L54 ${27 + jawOpen * 0.4}`}
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
        <g transform={`rotate(${armSwing}, 32, 30)`}>
          <path d="M32 30 Q28 36 26 42" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M26 42 L24 44 M26 42 L27 45 M26 42 L29 44" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
        <g transform={`rotate(${-armSwing}, 28, 30)`}>
          <path d="M28 30 Q24 36 22 42" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M22 42 L20 44 M22 42 L23 45 M22 42 L25 44" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75" />
        </g>
        <g transform={`rotate(${legSwing}, 18, 34)`}>
          <path d="M18 34 Q16 40 14 48" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M14 48 L11 50 M14 48 L14 51 M14 48 L17 50" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
        <g transform={`rotate(${-legSwing}, 26, 34)`}>
          <path d="M26 34 Q28 40 30 48" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M30 48 L27 50 M30 48 L30 51 M30 48 L33 50" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      </g>
    </svg>
  )
}

function RunningZombie({ legPhase }: { legPhase: number }) {
  const legSwing = Math.sin(legPhase * 0.7) * 15
  const armSwing = Math.sin(legPhase * 0.5) * 8
  const bodyLurch = Math.sin(legPhase * 0.6) * 3
  const headTilt = Math.sin(legPhase * 0.4) * 5
  const shuffle = Math.abs(Math.sin(legPhase * 0.7)) * 2
  
  return (
    <svg viewBox="0 0 55 45" className="w-full h-full">
      <g transform={`translate(${bodyLurch}, ${-shuffle})`}>
        <ellipse cx="27" cy="24" rx="10" ry="11" fill="white" fillOpacity="0.9" />
        <path d="M22 18 Q20 16 22 20" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M32 18 Q34 16 32 20" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M24 26 Q22 28 20 26" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M30 27 Q32 29 34 27" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
        
        <g transform={`rotate(${headTilt}, 27, 16)`}>
          <ellipse cx="27" cy="12" rx="8" ry="7" fill="white" fillOpacity="0.9" />
          <ellipse cx="27" cy="6" rx="5" ry="3" fill="white" fillOpacity="0.7" />
          <path d="M22 5 Q20 3 23 6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M32 5 Q34 3 31 6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
          <circle cx="24" cy="11" r="2" fill="oklch(0.25 0 0)" fillOpacity="0.6" />
          <circle cx="30" cy="10" r="2" fill="oklch(0.25 0 0)" fillOpacity="0.6" />
          <circle cx="24" cy="11" r="0.8" fill="oklch(0.25 0 0)" fillOpacity="0.9" />
          <circle cx="30" cy="10" r="0.8" fill="oklch(0.25 0 0)" fillOpacity="0.9" />
          <path d="M25 15 Q27 17 29 15" stroke="oklch(0.25 0 0)" strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M26 16 L26 17 M28 16 L28 17" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
        </g>
        
        <g transform={`rotate(${armSwing + 40}, 20, 22)`}>
          <path d="M20 22 Q14 28 10 32" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="9" cy="33" rx="2.5" ry="2" fill="white" fillOpacity="0.9" />
          <path d="M7 32 L6 34 M9 33 L9 36 M11 32 L12 34" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
        </g>
        
        <g transform={`rotate(${-armSwing + 50}, 34, 22)`}>
          <path d="M34 22 Q40 26 44 28" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="45" cy="29" rx="2.5" ry="2" fill="white" fillOpacity="0.9" />
          <path d="M43 28 L42 30 M45 29 L45 32 M47 28 L48 30" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
        </g>
        
        <g transform={`rotate(${legSwing}, 24, 34)`}>
          <path d="M24 34 Q22 40 20 46" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="19" cy="47" rx="3" ry="1.5" fill="white" fillOpacity="0.9" />
        </g>
        <g transform={`rotate(${-legSwing * 0.8}, 30, 34)`}>
          <path d="M30 34 Q32 40 34 46" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="35" cy="47" rx="3" ry="1.5" fill="white" fillOpacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

function RunningTRex({ legPhase }: { legPhase: number }) {
  const legSwing = Math.sin(legPhase) * 30
  const armWiggle = Math.sin(legPhase * 2) * 10
  const tailWave = Math.sin(legPhase * 0.8) * 12
  const bodyBob = Math.abs(Math.sin(legPhase)) * 3
  const jawSnap = Math.abs(Math.sin(legPhase * 1.5)) * 4
  
  return (
    <svg viewBox="-20 0 80 55" className="w-full h-full">
      <g transform={`translate(0, ${-bodyBob})`}>
        <path 
          d={`M10 28 Q${6 + tailWave} 26 ${2 + tailWave * 0.8} 22 Q${-2 + tailWave * 0.6} 18 ${-4 + tailWave * 0.4} 14`}
          stroke="white" 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <ellipse cx="24" cy="26" rx="16" ry="12" fill="white" fillOpacity="0.9" />
        <ellipse cx="42" cy="20" rx="12" ry="10" fill="white" fillOpacity="0.9" />
        <path 
          d={`M50 ${22 + jawSnap} Q54 ${24 + jawSnap} 58 ${22 + jawSnap * 0.5}`}
          stroke="white" 
          strokeWidth="5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M50 ${18 - jawSnap * 0.5} Q54 ${16 - jawSnap * 0.5} 58 ${18}`}
          stroke="white" 
          strokeWidth="5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M52 ${19 + jawSnap * 0.2} L53 ${21 + jawSnap * 0.3} M55 ${19 + jawSnap * 0.15} L56 ${21 + jawSnap * 0.25}`}
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
        <circle cx="46" cy="16" r="3" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="46" cy="16" r="1.5" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <path d="M38 12 L36 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M42 11 L42 5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <g transform={`rotate(${armWiggle}, 34, 28)`}>
          <path d="M34 28 Q32 32 30 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M30 36 L28 38 M30 36 L31 39" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
        <g transform={`rotate(${-armWiggle}, 30, 28)`}>
          <path d="M30 28 Q28 32 26 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M26 36 L24 38 M26 36 L27 39" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75" />
        </g>
        <g transform={`rotate(${legSwing}, 20, 34)`}>
          <path d="M20 34 Q18 42 16 50" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M16 50 L12 52 M16 50 L16 54 M16 50 L20 52" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
        </g>
        <g transform={`rotate(${-legSwing}, 28, 34)`}>
          <path d="M28 34 Q30 42 32 50" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M32 50 L28 52 M32 50 L32 54 M32 50 L36 52" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

function RunningAlligator({ legPhase }: { legPhase: number }) {
  const legSwing = Math.sin(legPhase) * 20
  const tailWave = Math.sin(legPhase * 0.8) * 10
  const bodyWiggle = Math.sin(legPhase * 1.2) * 2
  const jawOpen = Math.abs(Math.sin(legPhase * 1.5)) * 3
  
  return (
    <svg viewBox="-15 0 70 40" className="w-full h-full">
      <g transform={`translate(0, ${bodyWiggle})`}>
        <path 
          d={`M6 22 Q${2 + tailWave} 20 ${-2 + tailWave * 0.8} 18 Q${-6 + tailWave * 0.6} 16 ${-10 + tailWave * 0.4} 16`}
          stroke="white" 
          strokeWidth="5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <ellipse cx="20" cy="22" rx="16" ry="8" fill="white" fillOpacity="0.9" />
        <path d="M14 16 L16 14 M18 15 L20 12 M22 15 L24 12 M26 16 L28 14" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
        <ellipse cx="40" cy="20" rx="8" ry="6" fill="white" fillOpacity="0.9" />
        <path 
          d={`M46 ${22 + jawOpen * 0.5} Q50 ${23 + jawOpen} 54 ${22 + jawOpen * 0.5}`}
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M46 ${18 - jawOpen * 0.3} Q50 ${17 - jawOpen * 0.5} 54 ${18 - jawOpen * 0.3}`}
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M48 ${21 + jawOpen * 0.3} L49 ${23 + jawOpen * 0.4} M51 ${21 + jawOpen * 0.3} L52 ${23 + jawOpen * 0.4}`}
          stroke="white" 
          strokeWidth="1" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.6"
        />
        <circle cx="42" cy="16" r="2" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="42" cy="16" r="1" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <ellipse cx="44" cy="14" rx="1.5" ry="1" fill="white" fillOpacity="0.7" />
        <g transform={`rotate(${legSwing}, 28, 28)`}>
          <path d="M28 28 Q30 32 28 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M28 36 L26 38 M28 36 L28 39 M28 36 L30 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
        <g transform={`rotate(${-legSwing}, 32, 28)`}>
          <path d="M32 28 Q34 32 32 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M32 36 L30 38 M32 36 L32 39 M32 36 L34 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
        <g transform={`rotate(${-legSwing}, 12, 28)`}>
          <path d="M12 28 Q10 32 12 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M12 36 L10 38 M12 36 L12 39 M12 36 L14 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
        <g transform={`rotate(${legSwing}, 16, 28)`}>
          <path d="M16 28 Q18 32 16 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M16 36 L14 38 M16 36 L16 39 M16 36 L18 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      </g>
    </svg>
  )
}

function SwimmingAnglerfish({ legPhase }: { legPhase: number }) {
  const bodyWave = Math.sin(legPhase * 1.2) * 3
  const tailSwish = Math.sin(legPhase * 1.5) * 20
  const finWave = Math.sin(legPhase * 2) * 15
  const lureGlow = 0.5 + Math.abs(Math.sin(legPhase * 3)) * 0.5
  const lureBob = Math.sin(legPhase * 2) * 3
  const jawOpen = Math.abs(Math.sin(legPhase * 1.2)) * 4
  
  return (
    <svg viewBox="-5 0 60 45" className="w-full h-full">
      <g transform={`translate(0, ${bodyWave})`}>
        <g transform={`rotate(${tailSwish}, 12, 22)`}>
          <path 
            d="M12 22 Q6 18 2 22 Q6 26 12 22" 
            fill="white" 
            fillOpacity="0.85"
          />
        </g>
        <ellipse cx="28" cy="22" rx="18" ry="14" fill="white" fillOpacity="0.9" />
        <path d="M18 12 Q16 8 20 10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M24 10 Q24 6 28 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M32 10 Q34 6 36 9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M20 32 Q18 36 22 34" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M28 34 Q28 38 32 36" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <g transform={`rotate(${finWave}, 20, 18)`}>
          <ellipse cx="16" cy="14" rx="6" ry="3" fill="white" fillOpacity="0.75" />
        </g>
        <g transform={`rotate(${-finWave}, 20, 26)`}>
          <ellipse cx="16" cy="30" rx="5" ry="2.5" fill="white" fillOpacity="0.75" />
        </g>
        <path 
          d={`M36 16 Q40 ${10 + lureBob} 38 ${6 + lureBob}`}
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle 
          cx="38" 
          cy={5 + lureBob} 
          r="3" 
          fill="white" 
          fillOpacity={lureGlow}
        />
        <circle 
          cx="38" 
          cy={5 + lureBob} 
          r="1.5" 
          fill="white" 
          fillOpacity={0.9}
        />
        <circle cx="32" cy="18" r="4" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="33" cy="17" r="2" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <path 
          d={`M40 ${20 - jawOpen * 0.3} Q46 ${18 - jawOpen * 0.5} 50 ${20 - jawOpen * 0.3}`}
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M40 ${24 + jawOpen * 0.5} Q46 ${28 + jawOpen} 50 ${26 + jawOpen * 0.5}`}
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M42 ${21 - jawOpen * 0.2} L43 ${19 - jawOpen * 0.3} M45 ${20 - jawOpen * 0.15} L46 ${18 - jawOpen * 0.25} M48 ${20 - jawOpen * 0.1} L49 ${18 - jawOpen * 0.2}`}
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
        <path 
          d={`M42 ${25 + jawOpen * 0.3} L43 ${27 + jawOpen * 0.4} M45 ${26 + jawOpen * 0.25} L46 ${28 + jawOpen * 0.35} M48 ${26 + jawOpen * 0.2} L49 ${28 + jawOpen * 0.3}`}
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
      </g>
    </svg>
  )
}

function SwimmingShark({ legPhase }: { legPhase: number }) {
  const bodyWave = Math.sin(legPhase * 1.2) * 2
  const tailSwish = Math.sin(legPhase * 1.8) * 25
  const finWave = Math.sin(legPhase * 2) * 10
  const jawOpen = Math.abs(Math.sin(legPhase * 1.5)) * 2
  
  return (
    <svg viewBox="-5 0 60 40" className="w-full h-full">
      <g transform={`translate(0, ${bodyWave})`}>
        <g transform={`rotate(${tailSwish}, 8, 20)`}>
          <path 
            d="M8 20 Q2 14 0 20 Q2 26 8 20" 
            fill="white" 
            fillOpacity="0.85"
          />
        </g>
        <ellipse cx="28" cy="20" rx="20" ry="10" fill="white" fillOpacity="0.9" />
        <path 
          d="M28 10 L26 2 L32 10" 
          fill="white" 
          fillOpacity="0.9"
        />
        <g transform={`rotate(${finWave}, 20, 28)`}>
          <path 
            d="M20 28 L16 34 L24 28" 
            fill="white" 
            fillOpacity="0.8"
          />
        </g>
        <g transform={`rotate(${-finWave}, 36, 28)`}>
          <path 
            d="M36 28 L32 34 L40 28" 
            fill="white" 
            fillOpacity="0.8"
          />
        </g>
        <path 
          d="M14 18 L10 14 M18 17 L16 12 M22 16 L22 11" 
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.6"
        />
        <circle cx="40" cy="18" r="2.5" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="40" cy="18" r="1.2" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <path 
          d={`M46 ${18 - jawOpen * 0.3} Q50 ${17 - jawOpen * 0.5} 54 ${18 - jawOpen * 0.3}`}
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M46 ${22 + jawOpen * 0.5} Q50 ${24 + jawOpen} 54 ${22 + jawOpen * 0.5}`}
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d={`M48 ${19 + jawOpen * 0.2} L49 ${21 + jawOpen * 0.3} M51 ${19 + jawOpen * 0.15} L52 ${21 + jawOpen * 0.25}`}
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
        <path 
          d={`M48 ${21 + jawOpen * 0.3} L49 ${23 + jawOpen * 0.4} M51 ${21 + jawOpen * 0.25} L52 ${23 + jawOpen * 0.35}`}
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
      </g>
    </svg>
  )
}

function SwimmingWhale({ legPhase }: { legPhase: number }) {
  const bodyWave = Math.sin(legPhase * 0.8) * 2
  const tailSwish = Math.sin(legPhase * 1.2) * 20
  const finWave = Math.sin(legPhase * 1.5) * 12
  const spoutPhase = Math.sin(legPhase * 0.5)
  const showSpout = spoutPhase > 0.8
  
  return (
    <svg viewBox="-10 -5 75 55" className="w-full h-full">
      <g transform={`translate(0, ${bodyWave})`}>
        <g transform={`rotate(${tailSwish}, 8, 24)`}>
          <path 
            d="M8 24 Q0 16 -4 24 Q0 32 8 24" 
            fill="white" 
            fillOpacity="0.85"
          />
        </g>
        <ellipse cx="32" cy="24" rx="26" ry="16" fill="white" fillOpacity="0.9" />
        <ellipse cx="32" cy="28" rx="20" ry="10" fill="white" fillOpacity="0.7" />
        <g transform={`rotate(${finWave}, 24, 14)`}>
          <path 
            d="M24 14 Q20 4 28 8 Q32 12 28 16" 
            fill="white" 
            fillOpacity="0.85"
          />
        </g>
        <g transform={`rotate(${-finWave * 0.7}, 20, 34)`}>
          <ellipse cx="16" cy="36" rx="6" ry="3" fill="white" fillOpacity="0.75" />
        </g>
        <g transform={`rotate(${finWave * 0.7}, 44, 34)`}>
          <ellipse cx="48" cy="36" rx="6" ry="3" fill="white" fillOpacity="0.75" />
        </g>
        <circle cx="50" cy="20" r="3" fill="oklch(0.25 0 0)" fillOpacity="0.5" />
        <circle cx="51" cy="19" r="1.5" fill="oklch(0.25 0 0)" fillOpacity="0.8" />
        <path 
          d="M56 24 Q60 26 58 28" 
          stroke="white" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.8"
        />
        {showSpout && (
          <g opacity={0.6 + (spoutPhase - 0.8) * 2}>
            <path 
              d={`M36 8 Q34 ${-2 - (spoutPhase - 0.8) * 10} 32 ${-6 - (spoutPhase - 0.8) * 8}`}
              stroke="white" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              d={`M36 8 Q38 ${-2 - (spoutPhase - 0.8) * 10} 40 ${-6 - (spoutPhase - 0.8) * 8}`}
              stroke="white" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
            />
            <circle cx="32" cy={-8 - (spoutPhase - 0.8) * 8} r="2" fill="white" fillOpacity="0.7" />
            <circle cx="40" cy={-8 - (spoutPhase - 0.8) * 8} r="2" fill="white" fillOpacity="0.7" />
          </g>
        )}
      </g>
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
    case 10:
      return <RunningCthulhu legPhase={legPhase} />
    case 11:
      return <RunningBanana legPhase={legPhase} />
    case 12:
      return <RunningSquirrel legPhase={legPhase} />
    case 13:
      return <RunningSasquatch legPhase={legPhase} />
    case 14:
      return <RunningLizardKing legPhase={legPhase} />
    case 15:
      return <RunningZombie legPhase={legPhase} />
    case 16:
      return <RunningTRex legPhase={legPhase} />
    case 17:
      return <RunningAlligator legPhase={legPhase} />
    case 18:
      return <SwimmingAnglerfish legPhase={legPhase} />
    case 19:
      return <SwimmingShark legPhase={legPhase} />
    case 20:
      return <SwimmingWhale legPhase={legPhase} />
    default:
      return <RunningDog legPhase={legPhase} />
  }
}

function PeekingAnimal({ variant, side }: { variant: number; side: 'left' | 'right' }) {
  const peekAmount = 12
  const isLargeAnimal = variant === 8 || variant === 9 || variant === 10 || variant === 13 || variant === 14 || variant === 15 || variant === 16 || variant === 18 || variant === 20
  const isBanana = variant === 11
  
  return (
    <div
      className={`absolute ${isLargeAnimal ? 'w-16 h-16 md:w-20 md:h-20' : isBanana ? 'w-14 h-14 md:w-16 md:h-16' : 'w-10 h-10 md:w-12 md:h-12'}`}
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

type IdleState = 'hidden' | 'peeking' | 'walking' | 'running' | 'feeding'

function TileAnimal({ isAnimating, isHovered, animalIndex, totalAnimals, animalType, forcePeek, forceFeeding }: { isAnimating: boolean; isHovered: boolean; animalIndex: number; totalAnimals: number; animalType: number; forcePeek?: boolean; forceFeeding?: boolean }) {
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
    if (forcePeek) {
      clearAnimations()
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
      const side = Math.random() > 0.5 ? 'left' : 'right'
      setPeekSide(side)
      setIdleState('peeking')
    } else if (!forcePeek && idleState === 'peeking') {
      setIdleState('hidden')
    }
  }, [forcePeek])

  const forceFeedingRef = useRef(forceFeeding)
  forceFeedingRef.current = forceFeeding

  useEffect(() => {
    if (forceFeeding) {
      clearAnimations()
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
      
      const newDirection = Math.random() > 0.5 ? 1 : -1
      setDirection(newDirection)
      const startX = newDirection === 1 ? -25 : 125
      setPosition({ x: startX, y: 50 })
      setIdleState('feeding')
      startTimeRef.current = null
      
      const targetX = 50
      
      const animateToCenter = (timestamp: number) => {
        if (!forceFeedingRef.current) return
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const elapsed = timestamp - startTimeRef.current
        
        const phase = elapsed * 0.02
        setLegPhase(phase)
        
        const progress = Math.min(elapsed / 600, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        
        const newX = startX + (targetX - startX) * eased
        const bounce = Math.sin(phase * 2) * 2
        setPosition({ x: newX, y: 50 + bounce })
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateToCenter)
        } else {
          startTimeRef.current = null
          const animateJump = (ts: number) => {
            if (!forceFeedingRef.current) return
            if (!startTimeRef.current) startTimeRef.current = ts
            const jumpElapsed = ts - startTimeRef.current
            
            const jumpPhase = jumpElapsed * 0.005
            setLegPhase(jumpPhase)
            
            const jumpHeight = Math.abs(Math.sin(jumpPhase * 1.2)) * 12
            setPosition({ x: 50, y: 50 - jumpHeight })
            
            animationRef.current = requestAnimationFrame(animateJump)
          }
          animationRef.current = requestAnimationFrame(animateJump)
        }
      }
      
      animationRef.current = requestAnimationFrame(animateToCenter)
    } else if (!forceFeeding && idleState === 'feeding') {
      clearAnimations()
      
      const exitDirection = direction
      const startX = 50
      const targetX = exitDirection === 1 ? 125 : -25
      setPosition({ x: startX, y: 50 })
      startTimeRef.current = null
      
      const animateExit = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const elapsed = timestamp - startTimeRef.current
        
        const phase = elapsed * 0.025
        setLegPhase(phase)
        
        const progress = Math.min(elapsed / 500, 1)
        const eased = progress * progress
        
        const newX = startX + (targetX - startX) * eased
        const bounce = Math.sin(phase * 2) * 2
        setPosition({ x: newX, y: 50 + bounce })
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateExit)
        } else {
          setIdleState('hidden')
        }
      }
      
      animationRef.current = requestAnimationFrame(animateExit)
    }
  }, [forceFeeding])

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
    if (forcePeek || forceFeeding) return
    
    const scheduleIdleAction = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
      
      const delay = 3000 + Math.random() * 8000
      
      idleTimerRef.current = window.setTimeout(() => {
        if (isAnimating || isHovered || forcePeek || forceFeeding) {
          scheduleIdleAction()
          return
        }
        
        const action = Math.random()
        
        if (action < 0.5) {
          const side = Math.random() > 0.5 ? 'left' : 'right'
          setPeekSide(side)
          setIdleState('peeking')
          
          setTimeout(() => {
            if (!forcePeek && !forceFeeding) {
              setIdleState('hidden')
              scheduleIdleAction()
            }
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
            if (forceFeedingRef.current) {
              return
            }
            
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
        idleTimerRef.current = null
      }
    }
  }, [idleState, isAnimating, isHovered, forcePeek, forceFeeding])

  useEffect(() => {
    return () => {
      clearAnimations()
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [])

  const isLargeAnimal = animalType === 8 || animalType === 9 || animalType === 10 || animalType === 13 || animalType === 14 || animalType === 15 || animalType === 16 || animalType === 18 || animalType === 20

  return (
    <AnimatePresence mode="wait">
      {idleState === 'peeking' && (
        <motion.div
          key="peeking"
          initial={{ opacity: 0, x: peekSide === 'left' ? -20 : 20 }}
          animate={{ opacity: 0.9, x: 0 }}
          exit={{ opacity: 0, x: peekSide === 'left' ? -20 : 20 }}
          transition={{ 
            duration: 0.4,
            ease: "easeInOut"
          }}
          className="absolute inset-0 pointer-events-none overflow-visible"
        >
          <PeekingAnimal variant={animalType} side={peekSide} />
        </motion.div>
      )}
      {(idleState === 'walking' || idleState === 'running' || idleState === 'feeding') && (
        <motion.div
          key="moving"
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
      )}
    </AnimatePresence>
  )
}

function TallyTile({ 
  tally, 
  isAnimating,
  animatingCount,
  forcePeek,
  forceFeeding,
  onIncrement, 
  onStartLongPress, 
  onCancelLongPress,
  onOpenEdit 
}: { 
  tally: Tally
  isAnimating: boolean
  animatingCount: number
  forcePeek?: boolean
  forceFeeding?: boolean
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
              forcePeek={false}
              forceFeeding={false}
            />
          ))
        ) : (
          <TileAnimal 
            isAnimating={false} 
            isHovered={isHovered} 
            animalIndex={0} 
            totalAnimals={1} 
            animalType={animalType}
            forcePeek={forcePeek}
            forceFeeding={forceFeeding}
          />
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
          {tally.goal && tally.count < tally.goal && (
            <span className="text-xs text-white/70 font-medium">
              / {tally.goal}
            </span>
          )}
          {tally.goal && tally.count >= tally.goal && (
            <span className="text-xs text-white/90 font-medium flex items-center gap-1">
              <Trophy size={12} weight="fill" /> Goal!
            </span>
          )}
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

function CalendarView({ 
  events, 
  tallies, 
  dailyNotes,
  onClose,
  onUpdateEventNote,
  onUpdateDailyNote,
  onDeleteEvent,
  onUpdateEventChange
}: { 
  events: TallyEvent[]
  tallies: Tally[]
  dailyNotes: DailyTallyNote[]
  onClose: () => void
  onUpdateEventNote: (timestamp: number, note: string) => void
  onUpdateDailyNote: (date: string, tallyId: string, note: string) => void
  onDeleteEvent: (timestamp: number) => void
  onUpdateEventChange: (timestamp: number, newChange: number) => void
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDay = firstDayOfMonth.getDay()
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const getEventsForDay = (day: number) => {
    const dayStart = new Date(year, month, day).getTime()
    const dayEnd = new Date(year, month, day + 1).getTime()
    return events.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd)
  }
  
  const getTallyById = (id: string) => tallies.find(t => t.id === id)
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  const today = new Date()
  const isToday = (day: number) => 
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const [selectedDayEvents, setSelectedDayEvents] = useState<TallyEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({})
  const [editingDailyNotes, setEditingDailyNotes] = useState<Record<string, string>>({})
  const [collapsedTallies, setCollapsedTallies] = useState<Record<string, boolean>>({})
  const [editingChanges, setEditingChanges] = useState<Record<number, string>>({})
  const [pendingDeletes, setPendingDeletes] = useState<Set<number>>(new Set())

  const getDateKey = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getDailyNoteForTally = (day: number, tallyId: string) => {
    const dateKey = getDateKey(day)
    return dailyNotes.find(n => n.date === dateKey && n.tallyId === tallyId)?.note || ''
  }

  const getEventsByTallyForDay = (dayEvents: TallyEvent[]) => {
    return dayEvents.reduce((acc, event) => {
      if (!acc[event.tallyId]) {
        acc[event.tallyId] = { count: 0, tally: getTallyById(event.tallyId), events: [] }
      }
      acc[event.tallyId].count += event.change
      acc[event.tallyId].events.push(event)
      return acc
    }, {} as Record<string, { count: number; tally: Tally | undefined; events: TallyEvent[] }>)
  }

  const handleDayClick = (day: number, dayEvents: TallyEvent[]) => {
    if (dayEvents.length === 0) return
    setSelectedDay(day)
    setSelectedDayEvents(dayEvents)
    const notesMap: Record<number, string> = {}
    const changesMap: Record<number, string> = {}
    dayEvents.forEach(e => {
      notesMap[e.timestamp] = e.note || ''
      changesMap[e.timestamp] = String(e.change)
    })
    setEditingNotes(notesMap)
    setEditingChanges(changesMap)
    setPendingDeletes(new Set())
    
    const dailyNotesMap: Record<string, string> = {}
    const tallyIds = [...new Set(dayEvents.map(e => e.tallyId))]
    tallyIds.forEach(tallyId => {
      dailyNotesMap[tallyId] = getDailyNoteForTally(day, tallyId)
    })
    setEditingDailyNotes(dailyNotesMap)
    setCollapsedTallies({})
  }

  const toggleTallyCollapse = (tallyId: string) => {
    setCollapsedTallies(prev => ({
      ...prev,
      [tallyId]: !prev[tallyId]
    }))
  }

  const collapseAllTallies = () => {
    const allCollapsed: Record<string, boolean> = {}
    Object.keys(getEventsByTallyForDay(selectedDayEvents)).forEach(tallyId => {
      allCollapsed[tallyId] = true
    })
    setCollapsedTallies(allCollapsed)
  }

  const expandAllTallies = () => {
    setCollapsedTallies({})
  }

  const allCollapsed = Object.keys(getEventsByTallyForDay(selectedDayEvents)).length > 0 &&
    Object.keys(getEventsByTallyForDay(selectedDayEvents)).every(tallyId => collapsedTallies[tallyId])

  const handleSaveNotes = () => {
    if (selectedDay === null) return
    
    pendingDeletes.forEach(timestamp => {
      onDeleteEvent(timestamp)
    })
    
    selectedDayEvents.forEach(event => {
      if (pendingDeletes.has(event.timestamp)) return
      
      const newNote = editingNotes[event.timestamp] || ''
      if (newNote !== (event.note || '')) {
        onUpdateEventNote(event.timestamp, newNote)
      }
      
      const newChange = parseInt(editingChanges[event.timestamp]) || event.change
      if (newChange !== event.change) {
        onUpdateEventChange(event.timestamp, newChange)
      }
    })
    
    const dateKey = getDateKey(selectedDay)
    Object.entries(editingDailyNotes).forEach(([tallyId, note]) => {
      const existingNote = getDailyNoteForTally(selectedDay, tallyId)
      if (note !== existingNote) {
        onUpdateDailyNote(dateKey, tallyId, note)
      }
    })
    
    setSelectedDayEvents([])
    setSelectedDay(null)
    setEditingNotes({})
    setEditingChanges({})
    setEditingDailyNotes({})
    setPendingDeletes(new Set())
    toast.success('Changes saved')
  }

  const formatEventTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  const cells: React.ReactNode[] = []
  for (let i = 0; i < startingDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-20 md:h-24" />)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day)
    const eventsByTally = getEventsByTallyForDay(dayEvents)
    const hasEvents = dayEvents.length > 0
    
    cells.push(
      <button 
        key={day}
        onClick={() => handleDayClick(day, dayEvents)}
        disabled={!hasEvents}
        className={`h-20 md:h-24 border border-border/50 rounded-lg p-1.5 md:p-2 transition-colors text-left w-full ${
          isToday(day) ? 'bg-primary/10 border-primary/50' : 'bg-card/50'
        } ${hasEvents ? 'hover:bg-card hover:border-primary/30 cursor-pointer' : 'cursor-default'}`}
      >
        <div className={`text-xs md:text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
          {day}
        </div>
        <div className="space-y-0.5 overflow-y-auto max-h-12 md:max-h-16">
          {Object.entries(eventsByTally).map(([tallyId, { count, tally, events: tallyEvents }]) => {
            const hasDailyNote = getDailyNoteForTally(day, tallyId)
            return tally && (
              <div 
                key={tallyId}
                className="flex items-center gap-1 text-[10px] md:text-xs w-full px-0.5"
              >
                <div 
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: tally.color }}
                />
                <span className="truncate text-foreground/80">{tally.title}</span>
                <span className="font-medium text-foreground ml-auto flex items-center gap-0.5">
                  +{count}
                  {(tallyEvents.some(e => e.note) || hasDailyNote) && <NotePencil size={10} className="text-primary" />}
                </span>
              </div>
            )
          })}
        </div>
      </button>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Tally History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} weight="bold" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <CaretLeft size={20} weight="bold" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <CaretRight size={20} weight="bold" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            {monthNames[month]} {year}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {cells}
        </div>
        
        <div className="mt-6 p-4 bg-card rounded-xl border border-border">
          <h4 className="font-semibold text-foreground mb-3">Legend</h4>
          <div className="flex flex-wrap gap-3">
            {tallies.map(tally => (
              <div key={tally.id} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tally.color }}
                />
                <span className="text-foreground/80">{tally.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Click on a day to view details and edit notes
        </div>
      </div>

      <Dialog open={selectedDayEvents.length > 0} onOpenChange={(open) => {
        if (!open) {
          setSelectedDayEvents([])
          setSelectedDay(null)
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarBlank size={20} className="text-primary" weight="bold" />
              {selectedDay && `${monthNames[month]} ${selectedDay}, ${year}`}
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>{selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'entry' : 'entries'} on this day</span>
              {Object.keys(getEventsByTallyForDay(selectedDayEvents)).length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={allCollapsed ? expandAllTallies : collapseAllTallies}
                  className="h-7 text-xs gap-1"
                >
                  {allCollapsed ? (
                    <>
                      <CaretDown size={14} weight="bold" />
                      Expand All
                    </>
                  ) : (
                    <>
                      <CaretUp size={14} weight="bold" />
                      Collapse All
                    </>
                  )}
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedDayEvents.length > 0 && (
            <div className="space-y-4 pt-2 overflow-y-auto flex-1">
              {Object.entries(getEventsByTallyForDay(selectedDayEvents)).map(([tallyId, { tally, events: tallyEvents }]) => {
                const activeEvents = tallyEvents.filter(e => !pendingDeletes.has(e.timestamp))
                const editedCount = activeEvents.reduce((sum, e) => {
                  const editedChange = parseInt(editingChanges[e.timestamp]) || e.change
                  return sum + editedChange
                }, 0)
                
                return tally && (
                  <div key={tallyId} className="space-y-3">
                    <button
                      onClick={() => toggleTallyCollapse(tallyId)}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg w-full text-left hover:bg-secondary/70 transition-colors"
                    >
                      <div 
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: tally.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {tally.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activeEvents.length} {activeEvents.length === 1 ? 'entry' : 'entries'}
                          {pendingDeletes.size > 0 && tallyEvents.some(e => pendingDeletes.has(e.timestamp)) && (
                            <span className="text-destructive ml-1">
                              ({tallyEvents.filter(e => pendingDeletes.has(e.timestamp)).length} to delete)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {editedCount > 0 ? '+' : ''}{editedCount}
                      </div>
                      <div className="text-muted-foreground">
                        {collapsedTallies[tallyId] ? (
                          <CaretDown size={18} weight="bold" />
                        ) : (
                          <CaretUp size={18} weight="bold" />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {!collapsedTallies[tallyId] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 pl-2">
                            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                              <label 
                                htmlFor={`daily-note-${tallyId}`}
                                className="text-xs font-medium text-primary mb-2 block"
                              >
                                Daily Summary Note
                              </label>
                              <Textarea
                                id={`daily-note-${tallyId}`}
                                placeholder={`Overall note for ${tally.title} on this day...`}
                                value={editingDailyNotes[tallyId] || ''}
                                onChange={(e) => setEditingDailyNotes(prev => ({
                                  ...prev,
                                  [tallyId]: e.target.value
                                }))}
                                className="min-h-[60px] resize-none text-sm bg-background"
                              />
                            </div>
                            
                            <div className="text-xs text-muted-foreground font-medium px-1">
                              Individual Entries
                            </div>
                            
                            {tallyEvents.map((event, index) => {
                              const isMarkedForDelete = pendingDeletes.has(event.timestamp)
                              return (
                                <div 
                                  key={event.timestamp} 
                                  className={`space-y-2 p-3 rounded-lg border transition-all ${
                                    isMarkedForDelete 
                                      ? 'bg-destructive/10 border-destructive/30 opacity-60' 
                                      : 'bg-card/50 border-border/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-sm gap-2">
                                    <span className="text-muted-foreground">
                                      {formatEventTime(event.timestamp)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {isMarkedForDelete ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setPendingDeletes(prev => {
                                            const next = new Set(prev)
                                            next.delete(event.timestamp)
                                            return next
                                          })}
                                          className="h-7 text-xs text-primary"
                                        >
                                          Undo
                                        </Button>
                                      ) : (
                                        <>
                                          <div className="flex items-center gap-1">
                                            <Input
                                              type="number"
                                              value={editingChanges[event.timestamp] || ''}
                                              onChange={(e) => setEditingChanges(prev => ({
                                                ...prev,
                                                [event.timestamp]: e.target.value
                                              }))}
                                              className="w-16 h-7 text-sm text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setPendingDeletes(prev => new Set([...prev, event.timestamp]))}
                                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          >
                                            <Trash size={14} weight="bold" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {!isMarkedForDelete && (
                                    <Textarea
                                      id={`event-note-${tallyId}-${index}`}
                                      placeholder="Add a note for this entry..."
                                      value={editingNotes[event.timestamp] || ''}
                                      onChange={(e) => setEditingNotes(prev => ({
                                        ...prev,
                                        [event.timestamp]: e.target.value
                                      }))}
                                      className="min-h-[60px] resize-none text-sm"
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
              
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDayEvents([])
                    setSelectedDay(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveNotes}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function GoalCelebration({ 
  tally, 
  goal, 
  onClose 
}: { 
  tally: Tally
  goal: number
  onClose: () => void 
}) {
  const [legPhase, setLegPhase] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const animalType = tally.animalType ?? 0
  const isLargeAnimal = animalType === 8 || animalType === 9 || animalType === 10 || animalType === 13 || animalType === 14 || animalType === 15 || animalType === 16 || animalType === 18 || animalType === 20

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let animationId: number
    const animate = () => {
      setLegPhase(prev => prev + 0.08)
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        className="max-w-md w-full text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div 
            className={`mx-auto rounded-3xl flex items-center justify-center ${isLargeAnimal ? 'w-40 h-40 md:w-48 md:h-48' : 'w-32 h-32 md:w-40 md:h-40'}`}
            style={{ backgroundColor: tally.color }}
          >
            <motion.div
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                duration: 0.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`${isLargeAnimal ? 'w-32 h-32 md:w-40 md:h-40' : 'w-24 h-24 md:w-32 md:h-32'}`}
            >
              <RunningAnimal variant={animalType} legPhase={legPhase} />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center shadow-lg"
          >
            <Trophy size={32} weight="fill" className="text-amber-800" />
          </motion.div>
        </motion.div>

        {showContent && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.1, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              🎉 Congrats! 🎉
            </motion.h2>
            <p className="text-xl md:text-2xl text-foreground/90">
              You hit <span className="font-bold text-primary">{goal} {tally.title}</span>!
            </p>
            <p className="text-lg text-muted-foreground">
              What a pro! Keep up the great work!
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            onClick={onClose}
            size="lg"
            className="mt-4"
          >
            Awesome!
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function TallyApp({ user }: { user: UserInfo }) {
  const [tallies, setTallies] = useKV<Tally[]>(`tallies-${user.id}`, [])
  const [purchasedAnimals, setPurchasedAnimals] = useKV<number[]>(`purchased-animals-${user.id}`, [])
  const [tallyEvents, setTallyEvents] = useKV<TallyEvent[]>(`tally-events-${user.id}`, [])
  const [dailyTallyNotes, setDailyTallyNotes] = useKV<DailyTallyNote[]>(`daily-tally-notes-${user.id}`, [])
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
  const gridRef = useRef<HTMLDivElement>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [animalToPurchase, setAnimalToPurchase] = useState<{ id: number; name: string; price: number } | null>(null)
  const [purchaseTallyId, setPurchaseTallyId] = useState<string | null>(null)
  const [forcePeekAll, setForcePeekAll] = useState(false)
  const [forceFeedingAll, setForceFeedingAll] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [customAmountDialogOpen, setCustomAmountDialogOpen] = useState(false)
  const [customAmountTallyId, setCustomAmountTallyId] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('1')
  const [customNote, setCustomNote] = useState('')
  const [goalCelebration, setGoalCelebration] = useState<{ tally: Tally; goal: number } | null>(null)
  const isMobile = useIsMobile()

  const currentTallies = tallies ?? []
  const currentPurchased = purchasedAnimals ?? []
  const currentEvents = tallyEvents ?? []
  const currentDailyNotes = dailyTallyNotes ?? []
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

  useEffect(() => {
    if (!editingId) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (gridRef.current && !gridRef.current.contains(target)) {
        const radixPortal = (target as Element).closest?.('[data-radix-popper-content-wrapper]')
        if (radixPortal) return
        closeEditMode()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editingId])

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
    
    setTallyEvents((current) => [
      ...(current ?? []),
      { tallyId: id, timestamp: Date.now(), change: 1 }
    ])
    
    if (currentTally && currentTally.goal && newCount === currentTally.goal) {
      setTimeout(() => {
        setGoalCelebration({ tally: { ...currentTally, count: newCount }, goal: currentTally.goal! })
      }, 300)
    }
    
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
    const currentTally = currentTallies.find(t => t.id === id)
    if (currentTally && currentTally.count > 0) {
      setTallies((current) =>
        (current ?? []).map((t) => (t.id === id ? { ...t, count: Math.max(0, t.count - 1) } : t))
      )
      setTallyEvents((current) => [
        ...(current ?? []),
        { tallyId: id, timestamp: Date.now(), change: -1 }
      ])
    }
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

  const updateTallyGoal = (id: string, goal: number | undefined) => {
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === id ? { ...t, goal } : t))
    )
  }

  const handleAnimalSelect = (tallyId: string, animalId: number) => {
    const animal = ALL_ANIMALS.find(a => a.id === animalId)
    if (!animal) return
    
    const isPremium = 'price' in animal
    
    if (isPremium && !currentPurchased.includes(animalId)) {
      setAnimalToPurchase(animal as { id: number; name: string; price: number })
      setPurchaseTallyId(tallyId)
      setPurchaseDialogOpen(true)
      return
    }
    
    if (!isPremium && animal.unlockAt > totalTallies) {
      toast.error(`${animal.name} is locked`, {
        description: `Reach ${animal.unlockAt} total tallies to unlock.`,
      })
      return
    }
    
    updateTallyAnimal(tallyId, animalId)
  }

  const handlePurchase = () => {
    if (!animalToPurchase) return
    
    setPurchasedAnimals((current) => [...(current ?? []), animalToPurchase.id])
    
    if (purchaseTallyId) {
      updateTallyAnimal(purchaseTallyId, animalToPurchase.id)
    }
    
    toast.success(`${animalToPurchase.name} purchased!`, {
      description: 'You can now use this animal on any tally tile.',
    })
    setPurchaseDialogOpen(false)
    setAnimalToPurchase(null)
    setPurchaseTallyId(null)
  }

  const deleteTally = (id: string) => {
    setTallies((current) => (current ?? []).filter((t) => t.id !== id))
    setEditingId(null)
    setIsEditingName(false)
  }

  const openCustomAmountDialog = (tallyId: string) => {
    setCustomAmountTallyId(tallyId)
    setCustomAmount('1')
    setCustomNote('')
    setCustomAmountDialogOpen(true)
  }

  const handleAddCustomAmount = () => {
    if (!customAmountTallyId) return
    const amount = Math.max(1, parseInt(customAmount) || 1)
    
    const currentTally = currentTallies.find(t => t.id === customAmountTallyId)
    const newCount = currentTally ? currentTally.count + amount : amount
    
    setTallies((current) =>
      (current ?? []).map((t) => (t.id === customAmountTallyId ? { ...t, count: t.count + amount } : t))
    )
    
    setTallyEvents((current) => [
      ...(current ?? []),
      { tallyId: customAmountTallyId, timestamp: Date.now(), change: amount, note: customNote.trim() || undefined }
    ])
    
    if (currentTally && currentTally.goal && currentTally.count < currentTally.goal && newCount >= currentTally.goal) {
      setTimeout(() => {
        setGoalCelebration({ tally: { ...currentTally, count: newCount }, goal: currentTally.goal! })
      }, 300)
    }
    
    setAnimatingId(customAmountTallyId)
    setAnimatingCount(newCount)
    
    const maxAnimals = Math.min(newCount, 20)
    const lastAnimalStaggerDelay = (maxAnimals - 1) * 120
    const animationDuration = 1200
    const totalAnimationTime = lastAnimalStaggerDelay + animationDuration + 100
    
    setTimeout(() => {
      setAnimatingId(null)
      setAnimatingCount(0)
    }, totalAnimationTime)
    
    setCustomAmountDialogOpen(false)
    setCustomAmountTallyId(null)
    setEditingId(null)
    toast.success(`Added ${amount} to tally${customNote.trim() ? ' with note' : ''}`)
  }

  const handleCallAnimals = () => {
    if (currentTallies.length === 0) return
    setForceFeedingAll(false)
    setForcePeekAll(true)
    setTimeout(() => {
      setForcePeekAll(false)
    }, 2500)
  }

  const handleFeedAnimals = () => {
    if (currentTallies.length === 0) return
    setForcePeekAll(false)
    setForceFeedingAll(true)
    setTimeout(() => {
      setForceFeedingAll(false)
    }, 4000)
  }

  const closeEditMode = () => {
    setEditingId(null)
    setIsEditingName(false)
    setEditingTitle('')
  }

  const updateEventNote = (timestamp: number, note: string) => {
    setTallyEvents((current) =>
      (current ?? []).map((e) => 
        e.timestamp === timestamp 
          ? { ...e, note: note.trim() || undefined } 
          : e
      )
    )
  }

  const deleteEvent = (timestamp: number) => {
    const event = currentEvents.find(e => e.timestamp === timestamp)
    if (!event) return
    
    setTallies((current) =>
      (current ?? []).map((t) => 
        t.id === event.tallyId 
          ? { ...t, count: t.count - event.change } 
          : t
      )
    )
    
    setTallyEvents((current) =>
      (current ?? []).filter((e) => e.timestamp !== timestamp)
    )
  }

  const updateEventChange = (timestamp: number, newChange: number) => {
    const event = currentEvents.find(e => e.timestamp === timestamp)
    if (!event) return
    
    const diff = newChange - event.change
    
    setTallies((current) =>
      (current ?? []).map((t) => 
        t.id === event.tallyId 
          ? { ...t, count: t.count + diff } 
          : t
      )
    )
    
    setTallyEvents((current) =>
      (current ?? []).map((e) => 
        e.timestamp === timestamp 
          ? { ...e, change: newChange } 
          : e
      )
    )
  }

  const updateDailyNote = (date: string, tallyId: string, note: string) => {
    setDailyTallyNotes((current) => {
      const existing = (current ?? []).find(n => n.date === date && n.tallyId === tallyId)
      if (existing) {
        if (!note.trim()) {
          return (current ?? []).filter(n => !(n.date === date && n.tallyId === tallyId))
        }
        return (current ?? []).map(n => 
          n.date === date && n.tallyId === tallyId 
            ? { ...n, note: note.trim() } 
            : n
        )
      } else if (note.trim()) {
        return [...(current ?? []), { date, tallyId, note: note.trim() }]
      }
      return current ?? []
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div 
        className="fixed inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.7 0.1 280) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="relative max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2 py-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
            <span className="w-10 h-10 md:w-12 md:h-12 inline-block" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
              <RunningBanana legPhase={0} />
            </span>
            Tally Me Banana
            <span className="w-10 h-10 md:w-12 md:h-12 inline-block" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', transform: 'scaleX(-1)' }}>
              <RunningBanana legPhase={0} />
            </span>
          </h1>
          <p className="text-muted-foreground">
            Tap to count. Long press to edit.
          </p>
          
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCallAnimals}
              disabled={forcePeekAll || currentTallies.length === 0}
              className="gap-2"
            >
              <Megaphone size={16} weight="bold" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFeedAnimals}
              disabled={forceFeedingAll || currentTallies.length === 0}
              className="gap-2"
            >
              <PersonSimpleTaiChi size={16} weight="bold" />
              Dance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendar(true)}
              className="gap-2"
            >
              <CalendarBlank size={16} weight="bold" />
              History
            </Button>
          </div>
          
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

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {currentTallies.map((tally) => (
              <motion.div
                key={tally.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={editingId === tally.id && isMobile ? 'col-span-2 row-span-2' : ''}
              >
                {editingId === tally.id ? (
                  <Card className="aspect-square border-2 border-primary/50 bg-card overflow-hidden">
                    <CardContent className="h-full overflow-y-auto p-4 md:p-6">
                      <div className="flex flex-col items-center gap-4 md:gap-5 min-h-full justify-between">
                        <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
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
                            className="w-28 h-12 text-4xl md:text-5xl font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          
                          {isEditingName ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault()
                                updateTallyTitle(tally.id, editingTitle)
                              }}
                              className="flex gap-2 w-full max-w-xs"
                            >
                              <Input
                                id="edit-title"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="h-9 text-sm"
                                autoFocus
                              />
                              <Button
                                type="submit"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                              >
                                <Check size={16} weight="bold" />
                              </Button>
                            </form>
                          ) : (
                            <button
                              onClick={() => setIsEditingName(true)}
                              className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors text-center"
                            >
                              <span className="line-clamp-2 break-words">{tally.title}</span>
                              <PencilSimple size={16} className="shrink-0" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 md:gap-5 w-full items-center">
                          <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
                            {COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateTallyColor(tally.id, color)}
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full transition-all ${tally.color === color ? 'ring-2 ring-offset-2 md:ring-offset-3 ring-primary scale-110' : 'hover:scale-105'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>

                          <Select
                            value={String(tally.animalType ?? 0)}
                            onValueChange={(value) => handleAnimalSelect(tally.id, Number(value))}
                          >
                            <SelectTrigger className="w-full max-w-[200px] md:max-w-[240px] h-10 text-sm">
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
                                    className="text-sm"
                                  >
                                    <span className="flex items-center gap-2">
                                      {isUnlocked ? (
                                        <span className="flex items-center gap-1.5">
                                          {isPremium && <Crown size={14} className="text-amber-500" weight="fill" />}
                                          {animal.name}
                                        </span>
                                      ) : isPremium ? (
                                        <span className="flex items-center gap-1.5 text-amber-600">
                                          <CurrencyDollar size={14} weight="bold" />
                                          {animal.name} (${(animal as { price: number }).price})
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                          <Lock size={14} />
                                          {animal.name} ({animal.unlockAt})
                                        </span>
                                      )}
                                    </span>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-2 w-full max-w-[200px] md:max-w-[240px]">
                            <label htmlFor={`goal-input-${tally.id}`} className="text-xs text-muted-foreground whitespace-nowrap">Goal:</label>
                            <Input
                              id={`goal-input-${tally.id}`}
                              type="number"
                              min="1"
                              placeholder="None"
                              value={tally.goal ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '') {
                                  updateTallyGoal(tally.id, undefined)
                                } else {
                                  const goal = Math.max(1, parseInt(value) || 1)
                                  updateTallyGoal(tally.id, goal)
                                }
                              }}
                              className="h-9 text-sm flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => decrementTally(tally.id)}
                              className="h-10 w-10 md:h-12 md:w-12"
                            >
                              <Minus size={18} weight="bold" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openCustomAmountDialog(tally.id)}
                              className="h-10 w-10 md:h-12 md:w-12"
                              title="Add with note"
                            >
                              <NotePencil size={18} weight="bold" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteTally(tally.id)}
                              className="h-10 w-10 md:h-12 md:w-12"
                            >
                              <Trash size={18} weight="bold" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="default"
                            onClick={closeEditMode}
                            className="text-sm"
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
                    forcePeek={forcePeekAll}
                    forceFeeding={forceFeedingAll}
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

      <Dialog open={customAmountDialogOpen} onOpenChange={setCustomAmountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <NotePencil size={20} className="text-primary" weight="bold" />
              Add with Note
            </DialogTitle>
            <DialogDescription>
              Add a custom amount with an optional note.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddCustomAmount()
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <label htmlFor="custom-amount" className="text-sm font-medium">Amount</label>
              <Input
                id="custom-amount"
                type="number"
                min="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="custom-note" className="text-sm font-medium">Note (optional)</label>
              <Textarea
                id="custom-note"
                placeholder="e.g. Watched Inception with friends..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCustomAmountDialogOpen(false)
                  setCustomAmountTallyId(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!customAmount || parseInt(customAmount) < 1}>
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                    setPurchaseTallyId(null)
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

      <AnimatePresence>
        {showCalendar && (
          <CalendarView 
            events={currentEvents} 
            tallies={currentTallies}
            dailyNotes={currentDailyNotes}
            onClose={() => setShowCalendar(false)}
            onUpdateEventNote={updateEventNote}
            onUpdateDailyNote={updateDailyNote}
            onDeleteEvent={deleteEvent}
            onUpdateEventChange={updateEventChange}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {goalCelebration && (
          <GoalCelebration
            tally={goalCelebration.tally}
            goal={goalCelebration.goal}
            onClose={() => setGoalCelebration(null)}
          />
        )}
      </AnimatePresence>
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
