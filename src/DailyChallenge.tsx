import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, CalendarBlank, Check, Copy, Play, ShareNetwork, Trophy } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useStorage } from '@/hooks/use-storage'
import {
  DAILY_CHALLENGE_ATTEMPTS_KEY,
  type DailyChallengeAttempts,
} from '@/lib/daily-challenge-storage'

export interface DailyAnimal {
  id: number
  name: string
}

interface DailyChallengeProps {
  animals: DailyAnimal[]
  renderAnimal: (animalId: number, legPhase: number) => ReactNode
}

interface AnimalRun {
  animalId: number
  delayMs: number
  dances: boolean
  durationMs: number
  lane: number
  size: number
}

type RoundMode = 'single' | 'target' | 'most' | 'total'

interface DailyRound {
  animals: DailyAnimal[]
  animalCounts: Record<number, number>
  mode: RoundMode
  number: number
  total: number
  target: DailyAnimal
  targetCount: number
  runs: AnimalRun[]
  durationMs: number
}

type ChallengePhase = 'intro' | 'ready' | 'running' | 'answer' | 'feedback' | 'complete'
type ShareStatus = 'idle' | 'copied' | 'shared' | 'error'

const ROUND_RANGES = [
  { mode: 'single' as const, min: 10, max: 50, typeCount: 1 },
  { mode: 'target' as const, min: 20, max: 100, typeCount: 4 },
  { mode: 'most' as const, min: 30, max: 150, typeCount: 3 },
  { mode: 'total' as const, min: 50, max: 300, typeCount: 7 },
]

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function hashSeed(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed: number) {
  let state = seed || 1
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min
}

function shuffled<T>(items: T[], random: () => number) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, 0, index)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function distributeAnimals(total: number, animals: DailyAnimal[], random: () => number) {
  const counts = new Map<number, number>()
  animals.forEach((animal) => counts.set(animal.id, 1))

  for (let index = animals.length; index < total; index += 1) {
    const animal = animals[randomInt(random, 0, animals.length - 1)]
    counts.set(animal.id, (counts.get(animal.id) ?? 0) + 1)
  }

  return counts
}

function distributeMostAnimals(total: number, animals: DailyAnimal[], winner: DailyAnimal, random: () => number) {
  const winnerCount = randomInt(random, Math.ceil(total * 0.38), Math.floor(total * 0.5))
  const remaining = total - winnerCount
  const loserMinimum = Math.max(1, remaining - (winnerCount - 1))
  const loserMaximum = Math.min(winnerCount - 1, remaining - 1)
  const firstLoserCount = randomInt(random, loserMinimum, loserMaximum)
  const secondLoserCount = remaining - firstLoserCount
  const losers = animals.filter((animal) => animal.id !== winner.id)

  return new Map([
    [winner.id, winnerCount],
    [losers[0].id, firstLoserCount],
    [losers[1].id, secondLoserCount],
  ])
}

function getRoundDuration(roundIndex: number, total: number) {
  if (roundIndex === 0) return Math.min(14000, 8000 + total * 120)
  if (roundIndex === 1) return Math.min(19000, 10000 + total * 90)
  if (roundIndex === 2) return Math.min(22000, 12000 + total * 55)
  return Math.min(24000, 13000 + total * 38)
}

function createDailyRounds(dateKey: string, animals: DailyAnimal[]) {
  return ROUND_RANGES.map((settings, roundIndex): DailyRound => {
    const random = createRandom(hashSeed(`${dateKey}:round:${roundIndex + 1}`))
    const total = randomInt(random, settings.min, settings.max)
    const availableTypes = Math.min(settings.typeCount, animals.length, total)
    const selectedAnimals = shuffled(animals, random).slice(0, availableTypes)
    const target = settings.mode === 'single'
      ? selectedAnimals[0]
      : selectedAnimals[randomInt(random, 0, selectedAnimals.length - 1)]
    const counts = settings.mode === 'most'
      ? distributeMostAnimals(total, selectedAnimals, target, random)
      : distributeAnimals(total, selectedAnimals, random)
    const animalIds = selectedAnimals.flatMap((animal) =>
      Array.from({ length: counts.get(animal.id) ?? 0 }, () => animal.id)
    )
    const stream = shuffled(animalIds, random)
    const durationMs = getRoundDuration(roundIndex, total)
    const launchWindow = durationMs - 4200
    const runs = stream.map((animalId, index): AnimalRun => {
      const dances = random() < 0.12
      return {
        animalId,
        delayMs: Math.round((index / Math.max(1, stream.length - 1)) * launchWindow),
        dances,
        durationMs: randomInt(random, 1800, 2600) + (dances ? 1400 : 0),
        lane: randomInt(random, 0, 4),
        size: randomInt(random, 42, 68),
      }
    })

    if (!runs.some((run) => run.dances)) {
      runs[randomInt(random, 0, runs.length - 1)].dances = true
      runs.find((run) => run.dances)!.durationMs += 1400
    }

    return {
      animals: selectedAnimals,
      animalCounts: Object.fromEntries(counts),
      mode: settings.mode,
      number: roundIndex + 1,
      total,
      target,
      targetCount: settings.mode === 'total' ? total : counts.get(target.id) ?? 0,
      durationMs,
      runs,
    }
  })
}

function scoreAnswer(answer: number, correct: number) {
  const difference = Math.abs(answer - correct)
  return Math.max(0, Math.round(100 * (1 - difference / Math.max(1, correct))))
}

function scoreMostCommonAnswer(round: DailyRound, animalId: number) {
  if (animalId === round.target.id) return 100

  const selectedCount = round.animalCounts[animalId] ?? 0
  const secondHighestCount = Math.max(
    ...round.animals
      .filter((animal) => animal.id !== round.target.id)
      .map((animal) => round.animalCounts[animal.id] ?? 0)
  )

  return selectedCount === secondHighestCount ? 50 : 0
}

function getAccuracyMessage(answer: number, correct: number) {
  const difference = answer - correct
  if (difference === 0) return 'Perfect count!'

  const distance = Math.abs(difference)
  const direction = difference > 0 ? 'high' : 'low'
  const closeness = distance === 1
    ? 'So close!'
    : distance <= Math.max(2, Math.round(correct * 0.1))
      ? 'Very close!'
      : distance <= Math.max(4, Math.round(correct * 0.25))
        ? 'Good try!'
        : 'Keep practicing!'

  return `${closeness} You were ${distance} ${direction}.`
}

export function DailyChallenge({ animals, renderAnimal }: DailyChallengeProps) {
  const dateKey = getLocalDateKey()
  const rounds = useMemo(() => createDailyRounds(dateKey, animals), [animals, dateKey])
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<ChallengePhase>('intro')
  const [answer, setAnswer] = useState('')
  const [trackedCount, setTrackedCount] = useState(0)
  const [trackedAnimalCounts, setTrackedAnimalCounts] = useState<Record<number, number>>({})
  const [scores, setScores] = useState<number[]>([])
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle')
  const [, setDailyChallengeAttempts] = useStorage<DailyChallengeAttempts>(DAILY_CHALLENGE_ATTEMPTS_KEY, {})
  const trackedCountRef = useRef(0)
  const trackedAnimalCountsRef = useRef<Record<number, number>>({})
  const round = rounds[roundIndex]
  const homeUrl = import.meta.env.BASE_URL

  useEffect(() => {
    if (phase !== 'running') return
    const timer = window.setTimeout(() => {
      if (round.mode === 'most') {
        const counts = round.animals.map((animal) => ({
          animalId: animal.id,
          count: trackedAnimalCountsRef.current[animal.id] ?? 0,
        }))
        const highestCount = Math.max(...counts.map((item) => item.count))
        const leaders = counts.filter((item) => item.count === highestCount)
        setAnswer(leaders.length === 1 ? String(leaders[0].animalId) : '')
      } else {
        setAnswer(String(trackedCountRef.current))
      }
      setPhase('answer')
    }, round.durationMs)
    return () => window.clearTimeout(timer)
  }, [phase, round.durationMs, round.mode])

  const startRound = () => {
    setAnswer('')
    trackedCountRef.current = 0
    setTrackedCount(0)
    const initialAnimalCounts = Object.fromEntries(round.animals.map((animal) => [animal.id, 0]))
    trackedAnimalCountsRef.current = initialAnimalCounts
    setTrackedAnimalCounts(initialAnimalCounts)
    setPhase('running')
  }

  const incrementTrackedCount = (amount = 1) => {
    setTrackedCount((current) => {
      const next = current + amount
      trackedCountRef.current = next
      return next
    })
  }

  const incrementTrackedAnimal = (animalId: number, amount = 1) => {
    setTrackedAnimalCounts((current) => {
      const next = {
        ...current,
        [animalId]: (current[animalId] ?? 0) + amount,
      }
      trackedAnimalCountsRef.current = next
      return next
    })
  }

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault()
    const parsedAnswer = Number.parseInt(answer, 10)
    if (round.mode === 'most') {
      if (!round.animals.some((animal) => animal.id === parsedAnswer)) return
      setScores((current) => [...current, scoreMostCommonAnswer(round, parsedAnswer)])
      setPhase('feedback')
      return
    }

    if (!Number.isFinite(parsedAnswer) || parsedAnswer < 0) return
    setScores((current) => [...current, scoreAnswer(parsedAnswer, round.targetCount)])
    setPhase('feedback')
  }

  const continueChallenge = () => {
    if (roundIndex === rounds.length - 1) {
      const firstAttemptScore = scores.reduce((total, score) => total + score, 0)
      setDailyChallengeAttempts((current) => {
        const attempts = current ?? {}
        if (attempts[dateKey]) return attempts

        return {
          ...attempts,
          [dateKey]: {
            completedAt: Date.now(),
            maxScore: rounds.length * 100,
            score: firstAttemptScore,
          },
        }
      })
      setPhase('complete')
      return
    }

    setRoundIndex((current) => current + 1)
    setPhase('ready')
    setAnswer('')
    trackedCountRef.current = 0
    setTrackedCount(0)
    trackedAnimalCountsRef.current = {}
    setTrackedAnimalCounts({})
  }

  const resetChallenge = () => {
    setRoundIndex(0)
    setScores([])
    setShareStatus('idle')
    setAnswer('')
    trackedCountRef.current = 0
    setTrackedCount(0)
    trackedAnimalCountsRef.current = {}
    setTrackedAnimalCounts({})
    setPhase('intro')
  }

  const parsedAnswer = Number.parseInt(answer, 10)
  const finalScore = scores.reduce((total, score) => total + score, 0)
  const maxScore = rounds.length * 100
  const finalPercentage = Math.round((finalScore / maxScore) * 100)
  const selectedAnimal = round.animals.find((animal) => animal.id === parsedAnswer)
  const latestScore = scores[scores.length - 1]
  const formattedDate = new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const shareDate = new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const roundMarkers = scores.map((score) => {
    if (score === 100) return '🟩'
    if (score >= 75) return '🟨'
    if (score >= 50) return '🟧'
    if (score > 0) return '🟥'
    return '⬛'
  }).join('')
  const getDailyUrl = () => new URL('daily/', `${window.location.origin}${homeUrl}`).toString()
  const getShareText = (includeUrl: boolean) => [
    `Banana Tally — ${shareDate}`,
    `${finalScore}/${maxScore} ${roundMarkers}`,
    'Can you beat my score?',
    includeUrl ? getDailyUrl() : '',
  ].filter(Boolean).join('\n')

  const copyShareResult = async () => {
    try {
      await navigator.clipboard.writeText(getShareText(true))
      setShareStatus('copied')
    } catch (error) {
      console.error('Unable to copy daily challenge result:', error)
      setShareStatus('error')
    }
  }

  const shareResult = async () => {
    if (!navigator.share) {
      await copyShareResult()
      return
    }

    try {
      await navigator.share({
        title: 'Banana Tally daily challenge',
        text: getShareText(false),
        url: getDailyUrl(),
      })
      setShareStatus('shared')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('Unable to share daily challenge result:', error)
      setShareStatus('error')
    }
  }
  const isPlaying = phase !== 'intro' && phase !== 'complete'

  return (
    <div className={`min-h-screen bg-background p-3 md:p-5 ${isPlaying ? 'h-[100dvh] overflow-hidden' : ''}`}>
      <div
        className="fixed inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(0.7 0.1 280) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className={`relative max-w-5xl mx-auto ${isPlaying ? 'h-full flex flex-col gap-3' : 'space-y-5'}`}>
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" size="sm" asChild>
            <a href={homeUrl} className="gap-2">
              <ArrowLeft size={16} weight="bold" />
              Tallies
            </a>
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarBlank size={17} />
            {formattedDate}
          </div>
        </div>

        <header className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Animal Dash</h1>
        </header>

        {phase === 'intro' && (
          <Card className="max-w-2xl mx-auto border-primary/30">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['1', 'One animal', 'Count a single animal type.'],
                  ['2', 'Find the target', 'Ignore the distracting animals.'],
                  ['3', 'Pick the most', 'Choose the animal that appeared most.'],
                  ['4', 'Count them all', 'Count every animal in the dash.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="rounded-xl bg-secondary/60 p-4 text-center space-y-2">
                    <div className="w-8 h-8 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {number}
                    </div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full gap-2" size="lg" onClick={() => setPhase('ready')}>
                Start today&apos;s challenge
                <ArrowRight size={18} weight="bold" />
              </Button>
            </CardContent>
          </Card>
        )}

        {phase !== 'intro' && phase !== 'complete' && (
          <div className="flex flex-1 min-h-0 flex-col gap-3">
            <div className="flex items-center gap-2 max-w-2xl mx-auto" aria-label={`Round ${round.number} of ${rounds.length}`}>
              {rounds.map((item, index) => (
                <div
                  key={item.number}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= roundIndex ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>

            <Card className="flex-1 min-h-0 overflow-hidden border-primary/20">
              <CardContent className="p-0 h-full min-h-0 flex flex-col">
                <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
                  <div className="flex items-center gap-4">
                    {round.mode === 'target' && (
                      <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-primary/10 p-1.5">
                        {renderAnimal(round.target.id, 0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-primary">Round {round.number} of {rounds.length}</div>
                      <h2 className="text-xl md:text-2xl font-bold">
                        {round.mode === 'most'
                          ? 'Which animal appears most?'
                          : round.mode === 'total'
                            ? 'Count every animal'
                            : `Count the ${round.target.name}s`}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {round.mode === 'most'
                          ? 'Watch all three animal types, then choose the most frequent.'
                          : round.mode === 'total'
                            ? 'Tap the counter once for every animal that crosses.'
                            : `Tap the counter each time you see a ${round.target.name}.`}
                      </p>
                      {round.mode === 'most' && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {round.animals.map((animal) => (
                            <div key={animal.id} className="flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1">
                              <span className="w-8 h-8">{renderAnimal(animal.id, 0)}</span>
                              <span className="text-xs font-medium">{animal.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {phase === 'ready' && (
                    <Button onClick={startRound} className="gap-2">
                      <Play size={17} weight="fill" />
                      Begin round
                    </Button>
                  )}
                </div>

                <div className={
                  phase === 'ready' || phase === 'running'
                    ? round.mode === 'most'
                      ? 'grid flex-1 min-h-0 grid-rows-[auto_minmax(0,1fr)] sm:grid-rows-1 sm:grid-cols-[minmax(0,1fr)_240px]'
                      : 'grid flex-1 min-h-0 grid-rows-[auto_minmax(0,1fr)] sm:grid-rows-1 sm:grid-cols-[minmax(0,1fr)_200px]'
                    : 'flex-1 min-h-0'
                }>
                  <div className="relative order-2 sm:order-1 min-h-[180px] sm:min-h-0 h-full overflow-hidden bg-gradient-to-b from-secondary/35 to-background">
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/10 to-transparent" />
                    {[18, 35, 52, 69, 86].map((top) => (
                      <div
                        key={top}
                        className="absolute left-0 right-0 border-t border-dashed border-border/35"
                        style={{ top: `${top}%` }}
                      />
                    ))}

                    {phase === 'ready' && (
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                        <div className="space-y-3">
                          <div className="text-4xl font-bold text-primary">Get ready!</div>
                          <p className="text-muted-foreground">
                            {round.mode === 'most' ? 'Watch for which animal appears most.' : 'Use the counter to keep track.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {phase === 'running' && (
                      <div className="absolute inset-0" aria-hidden="true">
                        {round.runs.map((run, index) => (
                          <div
                            key={`${round.number}-${index}`}
                            className={`daily-animal-run absolute ${run.dances ? 'daily-animal-dance' : ''}`}
                            style={{
                              animationDelay: `${run.delayMs}ms`,
                              animationDuration: `${run.durationMs}ms`,
                              top: `${8 + run.lane * 18}%`,
                              width: `${run.size}px`,
                              height: `${run.size}px`,
                            }}
                          >
                            {renderAnimal(run.animalId, index * 0.85)}
                          </div>
                        ))}
                      </div>
                    )}

                    {phase === 'answer' && (
                      <form onSubmit={submitAnswer} className="absolute inset-0 flex items-center justify-center p-6">
                        <div className={`w-full text-center space-y-5 ${round.mode === 'most' ? 'max-w-2xl' : 'max-w-sm'}`}>
                          <div>
                            <p className="text-sm font-medium text-primary mb-1">Time to answer</p>
                            <h3 className="text-2xl md:text-3xl font-bold">
                              {round.mode === 'most'
                                ? 'Which animal appeared the most?'
                                : round.mode === 'total'
                                  ? 'How many animals did you see?'
                                  : `How many ${round.target.name}s did you see?`}
                            </h3>
                          </div>
                          {round.mode === 'most' ? (
                            <div className="grid grid-cols-3 gap-3">
                              {round.animals.map((animal) => {
                                const isSelected = answer === String(animal.id)
                                return (
                                  <button
                                    key={animal.id}
                                    type="button"
                                    onClick={() => setAnswer(String(animal.id))}
                                    className={`rounded-2xl border-2 p-3 transition-all ${
                                      isSelected
                                        ? 'border-primary bg-primary/15 ring-2 ring-primary/30'
                                        : 'border-border bg-card hover:border-primary/50'
                                    }`}
                                    aria-pressed={isSelected}
                                  >
                                    <span className="block w-16 h-16 mx-auto">{renderAnimal(animal.id, 0)}</span>
                                    <span className="block font-semibold mt-2">{animal.name}</span>
                                    <span className="block text-xs text-muted-foreground mt-1">
                                      Counted {trackedAnimalCounts[animal.id] ?? 0}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <Input
                              autoFocus
                              inputMode="numeric"
                              min="0"
                              type="number"
                              value={answer}
                              onChange={(event) => {
                                const nextAnswer = event.target.value.replace(/^0+(?=\d)/, '')
                                setAnswer(nextAnswer)
                              }}
                              className="h-16 text-3xl text-center"
                              aria-label={round.mode === 'total' ? 'Total number of animals' : `Number of ${round.target.name}s`}
                            />
                          )}
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={
                              round.mode === 'most'
                                ? !round.animals.some((animal) => animal.id === parsedAnswer)
                                : !Number.isFinite(parsedAnswer) || parsedAnswer < 0
                            }
                          >
                            {round.mode === 'most' ? 'Submit choice' : 'Check answer'}
                          </Button>
                        </div>
                      </form>
                    )}

                    {phase === 'feedback' && (
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="w-full max-w-lg text-center space-y-5">
                          {round.mode !== 'total' && (
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 p-2">
                              {renderAnimal(round.target.id, 0)}
                            </div>
                          )}
                          <div>
                            <h3 className="text-3xl font-bold">
                              {round.mode === 'most'
                                ? parsedAnswer === round.target.id
                                  ? 'Correct choice!'
                                  : latestScore === 50
                                    ? 'Second most!'
                                    : 'Not quite!'
                                : getAccuracyMessage(parsedAnswer, round.targetCount)}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                              {round.mode === 'most' ? (
                                <>
                                  <strong className="text-foreground">{round.target.name}</strong> appeared most
                                  {selectedAnimal && selectedAnimal.id !== round.target.id
                                    ? latestScore === 50
                                      ? `; ${selectedAnimal.name} was the runner-up.`
                                      : `; you chose ${selectedAnimal.name}.`
                                    : '.'}
                                </>
                              ) : (
                                <>
                                  You guessed <strong className="text-foreground">{parsedAnswer}</strong>. The answer was{' '}
                                  <strong className="text-foreground">{round.targetCount}</strong>.
                                </>
                              )}
                            </p>
                          </div>
                          <div className="text-xl font-semibold">
                            Round score: {latestScore} / 100
                          </div>
                          <Button size="lg" onClick={continueChallenge} className="gap-2">
                            {roundIndex === rounds.length - 1 ? 'See final score' : 'Next round'}
                            <ArrowRight size={18} weight="bold" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {(phase === 'ready' || phase === 'running') && (
                    <aside className="order-1 sm:order-2 p-3 md:p-4 border-b sm:border-b-0 sm:border-l border-border bg-card/70 flex flex-col gap-2">
                      <p className="text-xs text-center text-muted-foreground">
                        Tap or left-click for +1. Right-click for +5.
                      </p>
                      {round.mode === 'most' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 flex-1">
                          {round.animals.map((animal) => (
                            <button
                              key={animal.id}
                              type="button"
                              onClick={() => incrementTrackedAnimal(animal.id)}
                              onContextMenu={(event) => {
                                event.preventDefault()
                                if (phase === 'running') incrementTrackedAnimal(animal.id, 5)
                              }}
                              disabled={phase !== 'running'}
                              className="min-h-24 rounded-2xl border-2 border-primary/30 bg-primary/10 hover:bg-primary/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 transition-all flex flex-col items-center justify-center gap-1 p-2"
                              aria-label={`${animal.name} count: ${trackedAnimalCounts[animal.id] ?? 0}. Tap or left-click to add one; right-click to add five.`}
                            >
                              <span className="w-12 h-12">{renderAnimal(animal.id, 0)}</span>
                              <span className="text-xs font-semibold truncate max-w-full">{animal.name}</span>
                              <span className="text-3xl font-bold tabular-nums text-primary">
                                {trackedAnimalCounts[animal.id] ?? 0}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => incrementTrackedCount()}
                          onContextMenu={(event) => {
                            event.preventDefault()
                            if (phase === 'running') incrementTrackedCount(5)
                          }}
                          disabled={phase !== 'running'}
                          className="w-full h-28 sm:h-auto sm:flex-1 min-h-28 rounded-2xl border-2 border-primary/40 bg-primary/10 hover:bg-primary/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 transition-all flex sm:flex-col items-center justify-center gap-4 sm:gap-2"
                          aria-label={`Count tracker: ${trackedCount}. Tap or left-click to add one; right-click to add five.`}
                        >
                          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Tap counter
                          </span>
                          <span className="text-6xl lg:text-7xl font-bold tabular-nums text-primary">
                            {trackedCount}
                          </span>
                          <span className="text-sm text-muted-foreground">+1</span>
                        </button>
                      )}
                    </aside>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {phase === 'complete' && (
          <Card className="max-w-2xl mx-auto border-primary/30">
            <CardContent className="p-6 md:p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center">
                <Trophy size={42} weight="fill" className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Today&apos;s challenge complete</p>
                <h2 className="text-4xl font-bold mt-1">{finalScore} / {maxScore}</h2>
                <p className="text-muted-foreground mt-2">
                  {finalScore === maxScore
                    ? 'A flawless animal count!'
                    : finalPercentage >= 80
                      ? 'Excellent counting!'
                      : finalPercentage >= 50
                        ? 'Nice work. Come back tomorrow for a new challenge.'
                        : 'Those animals were quick. Try today’s challenge again!'}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scores.map((score, index) => (
                  <div key={index} className="rounded-xl bg-secondary/60 p-3">
                    <div className="text-xs text-muted-foreground">Round {index + 1}</div>
                    <div className="text-xl font-bold">{score}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-card to-amber-500/10 p-5 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-lg">🍌 Banana Tally</p>
                    <p className="text-sm text-muted-foreground">{shareDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums">{finalScore}/{maxScore}</p>
                    <p className="text-xs text-muted-foreground">Daily score</p>
                  </div>
                </div>
                <div className="mt-5 text-3xl tracking-widest" aria-label="Spoiler-free round results">
                  {roundMarkers}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Share your score without revealing any answers.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  {'share' in navigator && (
                    <Button className="flex-1 gap-2" onClick={shareResult}>
                      <ShareNetwork size={18} weight="bold" />
                      {shareStatus === 'shared' ? 'Shared!' : 'Share result'}
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 gap-2 hover:text-white" onClick={copyShareResult}>
                    {shareStatus === 'copied'
                      ? <Check size={18} weight="bold" />
                      : <Copy size={18} weight="bold" />}
                    {shareStatus === 'copied' ? 'Copied!' : 'Copy result'}
                  </Button>
                </div>
                {shareStatus === 'error' && (
                  <p className="mt-3 text-sm text-destructive" role="alert">
                    Couldn&apos;t share this result. Please try copying it again.
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 hover:text-white" asChild>
                  <a href={homeUrl}>Back to tallies</a>
                </Button>
                <Button className="flex-1" onClick={resetChallenge}>
                  Play again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
