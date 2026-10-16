import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, CalendarBlank, Play, Trophy } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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

interface DailyRound {
  mode: 'single' | 'target' | 'total'
  number: number
  total: number
  target: DailyAnimal
  targetCount: number
  runs: AnimalRun[]
  durationMs: number
}

type ChallengePhase = 'intro' | 'ready' | 'running' | 'answer' | 'feedback' | 'complete'

const ROUND_RANGES = [
  { min: 10, max: 50, typeCount: 1 },
  { min: 20, max: 100, typeCount: 4 },
  { min: 30, max: 300, typeCount: 7 },
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

function getRoundDuration(roundIndex: number, total: number) {
  if (roundIndex === 0) return Math.min(14000, 8000 + total * 120)
  if (roundIndex === 1) return Math.min(19000, 10000 + total * 90)
  return Math.min(24000, 13000 + total * 38)
}

function createDailyRounds(dateKey: string, animals: DailyAnimal[]) {
  return ROUND_RANGES.map((settings, roundIndex): DailyRound => {
    const random = createRandom(hashSeed(`${dateKey}:round:${roundIndex + 1}`))
    const total = randomInt(random, settings.min, settings.max)
    const availableTypes = Math.min(settings.typeCount, animals.length, total)
    const selectedAnimals = shuffled(animals, random).slice(0, availableTypes)
    const counts = distributeAnimals(total, selectedAnimals, random)
    const target = roundIndex === 0
      ? selectedAnimals[0]
      : selectedAnimals[randomInt(random, 0, selectedAnimals.length - 1)]
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
      mode: roundIndex === 0 ? 'single' : roundIndex === 1 ? 'target' : 'total',
      number: roundIndex + 1,
      total,
      target,
      targetCount: roundIndex === 2 ? total : counts.get(target.id) ?? 0,
      durationMs,
      runs,
    }
  })
}

function scoreAnswer(answer: number, correct: number) {
  const difference = Math.abs(answer - correct)
  return Math.max(0, Math.round(100 * (1 - difference / Math.max(1, correct))))
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
  const [scores, setScores] = useState<number[]>([])
  const trackedCountRef = useRef(0)
  const round = rounds[roundIndex]
  const homeUrl = import.meta.env.BASE_URL

  useEffect(() => {
    if (phase !== 'running') return
    const timer = window.setTimeout(() => {
      setAnswer(String(trackedCountRef.current))
      setPhase('answer')
    }, round.durationMs)
    return () => window.clearTimeout(timer)
  }, [phase, round.durationMs])

  const startRound = () => {
    setAnswer('')
    trackedCountRef.current = 0
    setTrackedCount(0)
    setPhase('running')
  }

  const incrementTrackedCount = () => {
    setTrackedCount((current) => {
      const next = current + 1
      trackedCountRef.current = next
      return next
    })
  }

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault()
    const parsedAnswer = Number.parseInt(answer, 10)
    if (!Number.isFinite(parsedAnswer) || parsedAnswer < 0) return

    setScores((current) => [...current, scoreAnswer(parsedAnswer, round.targetCount)])
    setPhase('feedback')
  }

  const continueChallenge = () => {
    if (roundIndex === rounds.length - 1) {
      setPhase('complete')
      return
    }

    setRoundIndex((current) => current + 1)
    setPhase('ready')
    setAnswer('')
    trackedCountRef.current = 0
    setTrackedCount(0)
  }

  const resetChallenge = () => {
    setRoundIndex(0)
    setScores([])
    setAnswer('')
    trackedCountRef.current = 0
    setTrackedCount(0)
    setPhase('intro')
  }

  const parsedAnswer = Number.parseInt(answer, 10)
  const finalScore = scores.reduce((total, score) => total + score, 0)
  const formattedDate = new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div
        className="fixed inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(0.7 0.1 280) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className="relative max-w-5xl mx-auto space-y-6">
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

        <header className="text-center space-y-3 py-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 p-2">
              {renderAnimal(11, 0)}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Daily Animal Dash</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three counting challenges generated from today&apos;s date, keeping the challenge consistent all day.
          </p>
        </header>

        {phase === 'intro' && (
          <Card className="max-w-2xl mx-auto border-primary/30">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['1', 'One animal', 'Count a single animal type.'],
                  ['2', 'Find the target', 'Ignore the distracting animals.'],
                  ['3', 'Count them all', 'Count every animal in the dash.'],
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
          <>
            <div className="flex items-center gap-2 max-w-2xl mx-auto" aria-label={`Round ${round.number} of 3`}>
              {rounds.map((item, index) => (
                <div
                  key={item.number}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= roundIndex ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>

            <Card className="overflow-hidden border-primary/20">
              <CardContent className="p-0">
                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border">
                  <div className="flex items-center gap-4">
                    {round.mode === 'target' && (
                      <div className="w-16 h-16 shrink-0 rounded-xl bg-primary/10 p-1.5">
                        {renderAnimal(round.target.id, 0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-primary">Round {round.number} of 3</div>
                      <h2 className="text-2xl font-bold">
                        {round.mode === 'total' ? 'Count every animal' : `Count the ${round.target.name}s`}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {round.mode === 'total'
                          ? 'Tap the counter once for every animal that crosses.'
                          : `Tap the counter each time you see a ${round.target.name}.`}
                      </p>
                    </div>
                  </div>
                  {phase === 'ready' && (
                    <Button onClick={startRound} className="gap-2">
                      <Play size={17} weight="fill" />
                      Begin round
                    </Button>
                  )}
                </div>

                <div className={phase === 'ready' || phase === 'running' ? 'grid lg:grid-cols-[minmax(0,1fr)_220px]' : ''}>
                  <div className="relative order-2 lg:order-1 h-[320px] md:h-[430px] overflow-hidden bg-gradient-to-b from-secondary/35 to-background">
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
                          <p className="text-muted-foreground">Use the counter to keep track.</p>
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
                        <div className="w-full max-w-sm text-center space-y-5">
                          <div>
                            <p className="text-sm font-medium text-primary mb-1">Time to answer</p>
                            <h3 className="text-2xl md:text-3xl font-bold">
                              {round.mode === 'total'
                                ? 'How many animals did you see?'
                                : `How many ${round.target.name}s did you see?`}
                            </h3>
                          </div>
                          <Input
                            autoFocus
                            inputMode="numeric"
                            min="0"
                            type="number"
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            className="h-16 text-3xl text-center"
                            aria-label={round.mode === 'total' ? 'Total number of animals' : `Number of ${round.target.name}s`}
                          />
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={!Number.isFinite(parsedAnswer) || parsedAnswer < 0}
                          >
                            Check answer
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
                              {getAccuracyMessage(parsedAnswer, round.targetCount)}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                              You guessed <strong className="text-foreground">{parsedAnswer}</strong>. The answer was{' '}
                              <strong className="text-foreground">{round.targetCount}</strong>.
                            </p>
                          </div>
                          <div className="text-xl font-semibold">
                            Round score: {scores[scores.length - 1]} / 100
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
                    <aside className="order-1 lg:order-2 p-4 md:p-5 border-b lg:border-b-0 lg:border-l border-border bg-card/70">
                      <button
                        type="button"
                        onClick={incrementTrackedCount}
                        disabled={phase !== 'running'}
                        className="w-full h-32 lg:h-full min-h-32 rounded-2xl border-2 border-primary/40 bg-primary/10 hover:bg-primary/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 transition-all flex lg:flex-col items-center justify-center gap-4 lg:gap-2"
                        aria-label={`Count tracker: ${trackedCount}. Tap to add one.`}
                      >
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Tap counter
                        </span>
                        <span className="text-6xl lg:text-7xl font-bold tabular-nums text-primary">
                          {trackedCount}
                        </span>
                        <span className="text-sm text-muted-foreground">+1</span>
                      </button>
                    </aside>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {phase === 'complete' && (
          <Card className="max-w-2xl mx-auto border-primary/30">
            <CardContent className="p-6 md:p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center">
                <Trophy size={42} weight="fill" className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Today&apos;s challenge complete</p>
                <h2 className="text-4xl font-bold mt-1">{finalScore} / 300</h2>
                <p className="text-muted-foreground mt-2">
                  {finalScore === 300
                    ? 'A flawless animal count!'
                    : finalScore >= 240
                      ? 'Excellent counting!'
                      : finalScore >= 150
                        ? 'Nice work. Come back tomorrow for a new challenge.'
                        : 'Those animals were quick. Try today’s challenge again!'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {scores.map((score, index) => (
                  <div key={index} className="rounded-xl bg-secondary/60 p-3">
                    <div className="text-xs text-muted-foreground">Round {index + 1}</div>
                    <div className="text-xl font-bold">{score}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" asChild>
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
