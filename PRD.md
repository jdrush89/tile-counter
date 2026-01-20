# Tile Counting App

A practical calculator that helps users determine how many tiles they need to cover a given area, accounting for waste and different tile sizes.

**Experience Qualities**:
1. **Precise** - Calculations are accurate and clearly presented with no ambiguity
2. **Efficient** - Users can quickly input dimensions and get results without friction
3. **Trustworthy** - The interface feels professional and reliable for planning real projects

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple inputs for room and tile dimensions, waste percentage, and real-time calculation results with the ability to save projects

## Essential Features

### 1. Room Dimension Input
- **Functionality**: Input fields for room width and length
- **Purpose**: Capture the total area to be tiled
- **Trigger**: User enters values in input fields
- **Progression**: Enter width → Enter length → Area auto-calculates
- **Success criteria**: Area displays correctly in square feet/meters

### 2. Tile Size Input
- **Functionality**: Input fields for individual tile width and height
- **Purpose**: Define the coverage of each tile
- **Trigger**: User enters tile dimensions
- **Progression**: Enter tile width → Enter tile height → Coverage per tile shown
- **Success criteria**: Single tile area calculates correctly

### 3. Waste Percentage Slider
- **Functionality**: Adjustable slider for waste/extra tile percentage (5-20%)
- **Purpose**: Account for cuts, breakage, and mistakes
- **Trigger**: User adjusts slider
- **Progression**: Drag slider → Percentage updates → Total tiles recalculates
- **Success criteria**: Total includes waste buffer

### 4. Results Display
- **Functionality**: Shows total tiles needed, area coverage, and boxes (if applicable)
- **Purpose**: Give users actionable purchasing information
- **Trigger**: Automatic calculation when inputs change
- **Progression**: Inputs change → Results animate update
- **Success criteria**: Clear, prominent display of tile count

## Edge Case Handling
- **Zero/Empty Values**: Show placeholder result, disable calculation until valid inputs
- **Decimal Inputs**: Accept and handle fractional measurements
- **Very Large Areas**: Format numbers with commas for readability
- **Invalid Characters**: Only allow numeric input

## Design Direction
The design should feel like a premium construction tool - clean, geometric, and trustworthy. Think of the precision of architectural blueprints mixed with modern app aesthetics. Grid patterns subtly reinforce the tile theme.

## Color Selection
- **Primary Color**: `oklch(0.55 0.15 250)` - A confident slate blue that conveys professionalism and precision
- **Secondary Colors**: `oklch(0.96 0.01 250)` - Soft blue-gray for cards and surfaces
- **Accent Color**: `oklch(0.75 0.15 150)` - Fresh teal for highlights and CTAs
- **Background**: `oklch(0.98 0.005 250)` - Near-white with subtle warmth
- **Foreground/Background Pairings**:
  - Background (near-white): Foreground `oklch(0.25 0.02 250)` - Ratio 12:1 ✓
  - Primary (slate blue): White text `oklch(0.98 0 0)` - Ratio 7:1 ✓
  - Accent (teal): Dark text `oklch(0.2 0.02 250)` - Ratio 8:1 ✓

## Font Selection
The typography should feel technical yet approachable - precise like engineering specs but friendly for DIYers.

- **Primary Font**: Space Grotesk - geometric, modern, slightly technical
- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold/32px/tight
  - H2 (Section Headers): Space Grotesk SemiBold/20px/normal
  - Body/Labels: Space Grotesk Regular/16px/relaxed
  - Results Numbers: Space Grotesk Bold/48px/tight

## Animations
Subtle, purposeful animations reinforce the precision theme - numbers should tick up/down when recalculating, and the results card should have a gentle pulse when values update.

## Component Selection
- **Components**:
  - Card: Main container for calculator sections with subtle shadow
  - Input: Number inputs for dimensions with unit labels
  - Slider: Waste percentage with visual tick marks
  - Label: Clear field labels
  - Separator: Divide input sections from results
- **Customizations**: Custom tile grid pattern background, animated counter for results
- **States**: 
  - Inputs: Focus ring in accent color, error state in red
  - Results: Gentle scale animation on update
- **Icon Selection**: GridFour for tiles, Ruler for dimensions, Percent for waste
- **Spacing**: 16px (4) for tight groups, 24px (6) for sections, 32px (8) for major divisions
- **Mobile**: Single column layout, full-width inputs, sticky results at bottom
