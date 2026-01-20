import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { GridFour, Ruler, Percent, Package, Square } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [roomWidth, setRoomWidth] = useState<string>('')
  const [roomLength, setRoomLength] = useState<string>('')
  const [tileWidth, setTileWidth] = useState<string>('12')
  const [tileHeight, setTileHeight] = useState<string>('12')
  const [wastePercent, setWastePercent] = useState<number>(10)
  const [tilesPerBox, setTilesPerBox] = useState<string>('10')

  const roomWidthNum = parseFloat(roomWidth) || 0
  const roomLengthNum = parseFloat(roomLength) || 0
  const tileWidthNum = parseFloat(tileWidth) || 0
  const tileHeightNum = parseFloat(tileHeight) || 0
  const tilesPerBoxNum = parseInt(tilesPerBox) || 1

  const roomAreaSqFt = (roomWidthNum * roomLengthNum)
  const tileAreaSqIn = tileWidthNum * tileHeightNum
  const tileAreaSqFt = tileAreaSqIn / 144

  const baseTilesNeeded = tileAreaSqFt > 0 ? roomAreaSqFt / tileAreaSqFt : 0
  const tilesWithWaste = Math.ceil(baseTilesNeeded * (1 + wastePercent / 100))
  const boxesNeeded = Math.ceil(tilesWithWaste / tilesPerBoxNum)

  const isValid = roomWidthNum > 0 && roomLengthNum > 0 && tileWidthNum > 0 && tileHeightNum > 0

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    const cleaned = value.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) return
    setter(cleaned)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.55 0.15 250) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.55 0.15 250) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2 py-4">
          <div className="inline-flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <GridFour size={28} weight="bold" className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Tile Counter
            </h1>
          </div>
          <p className="text-muted-foreground">
            Calculate exactly how many tiles you need for your project
          </p>
        </header>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ruler size={20} weight="bold" className="text-primary" />
              Room Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-width" className="text-sm font-medium">
                  Width
                </Label>
                <div className="relative">
                  <Input
                    id="room-width"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={roomWidth}
                    onChange={(e) => handleNumericInput(e.target.value, setRoomWidth)}
                    className="pr-10 text-lg font-medium"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ft
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-length" className="text-sm font-medium">
                  Length
                </Label>
                <div className="relative">
                  <Input
                    id="room-length"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={roomLength}
                    onChange={(e) => handleNumericInput(e.target.value, setRoomLength)}
                    className="pr-10 text-lg font-medium"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ft
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Area</span>
              <span className="font-semibold text-foreground">
                {roomAreaSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq ft
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Square size={20} weight="bold" className="text-primary" />
              Tile Size
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tile-width" className="text-sm font-medium">
                  Width
                </Label>
                <div className="relative">
                  <Input
                    id="tile-width"
                    type="text"
                    inputMode="decimal"
                    placeholder="12"
                    value={tileWidth}
                    onChange={(e) => handleNumericInput(e.target.value, setTileWidth)}
                    className="pr-10 text-lg font-medium"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    in
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tile-height" className="text-sm font-medium">
                  Height
                </Label>
                <div className="relative">
                  <Input
                    id="tile-height"
                    type="text"
                    inputMode="decimal"
                    placeholder="12"
                    value={tileHeight}
                    onChange={(e) => handleNumericInput(e.target.value, setTileHeight)}
                    className="pr-10 text-lg font-medium"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    in
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tile Area</span>
              <span className="font-semibold text-foreground">
                {tileAreaSqIn.toLocaleString()} sq in ({tileAreaSqFt.toFixed(3)} sq ft)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent size={20} weight="bold" className="text-primary" />
              Extra for Waste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Account for cuts, breakage & mistakes
                </span>
                <span className="text-lg font-bold text-primary">{wastePercent}%</span>
              </div>
              <Slider
                id="waste-slider"
                value={[wastePercent]}
                onValueChange={([val]) => setWastePercent(val)}
                min={5}
                max={25}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5% (Simple layout)</span>
                <span>25% (Complex cuts)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package size={20} weight="bold" className="text-primary" />
              Packaging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tiles-per-box" className="text-sm font-medium">
                Tiles per Box
              </Label>
              <div className="relative max-w-[200px]">
                <Input
                  id="tiles-per-box"
                  type="text"
                  inputMode="numeric"
                  placeholder="10"
                  value={tilesPerBox}
                  onChange={(e) => handleNumericInput(e.target.value, setTilesPerBox)}
                  className="pr-14 text-lg font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  tiles
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <motion.div
          layout
          className="sticky bottom-4"
        >
          <Card className="shadow-xl border-2 border-accent/30 bg-gradient-to-br from-card to-secondary/30">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {isValid ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Tiles Needed</p>
                      <motion.p
                        key={tilesWithWaste}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl md:text-6xl font-bold text-primary tracking-tight"
                      >
                        {tilesWithWaste.toLocaleString()}
                      </motion.p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ({baseTilesNeeded.toFixed(0)} base + {Math.ceil(baseTilesNeeded * wastePercent / 100)} extra)
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-secondary/60 rounded-lg p-4 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-foreground">
                          {boxesNeeded.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Boxes to Buy</p>
                      </div>
                      <div className="bg-secondary/60 rounded-lg p-4 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-foreground">
                          {(boxesNeeded * tilesPerBoxNum - tilesWithWaste).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Extra Tiles</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <GridFour size={48} weight="light" className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      Enter room and tile dimensions to calculate
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <footer className="text-center text-xs text-muted-foreground pb-8 pt-4">
          Tip: Always buy a few extra tiles for future repairs
        </footer>
      </div>
    </div>
  )
}

export default App
