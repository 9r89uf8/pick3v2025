# Pick3 V2025 System Documentation

## Overview
Pick3 V2025 is a Next.js lottery analysis and prediction system that supports two play types: **COMBO** and **STRAIGHT**. The system generates number combinations, analyzes historical draws, and provides statistical insights for Pick 3 lottery games.

## System Architecture

### Game Types
- **COMBO**: Numbers can be in any order (sorted analysis)
- **STRAIGHT**: Numbers must match exact order (positional analysis)

### Core Workflow
```
User selects tab (COMBO/STRAIGHT) → Clicks "check" button → System calls appropriate testing API → Displays analysis results
```

## API Structure

### Play Generation APIs
- `/api/play/combo` - Generates COMBO play numbers (BBA + BAA patterns)
- `/api/play/straight` - Generates STRAIGHT play numbers (6 different patterns)

### Testing/Analysis APIs  
- `/api/test/combo` - Analyzes historical draws for COMBO rules
- `/api/test/straight` - Analyzes historical draws for STRAIGHT rules

### Display/Statistics APIs
- `/api/display/combo/create` - Generates monthly COMBO statistics
- `/api/display/combo/get` - Retrieves COMBO statistics for display
- `/api/display/straight/create` - Generates monthly STRAIGHT statistics  
- `/api/display/straight/get` - Retrieves STRAIGHT statistics for display

### Key Validation Rules
Both play types use A/B categorization:
- **B Numbers**: 0, 1, 2, 3, 4
- **A Numbers**: 5, 6, 7, 8, 9

**COMBO Rules:**
- Only BBA and BAA patterns allowed
- For BBA: difference between B numbers ≤ 2
- For BAA: difference between A numbers ≤ 2

**STRAIGHT Rules:**
- Patterns: BBA, BAB, ABB, BAA, ABA, AAB
- Same difference rules but position-dependent

## Component Architecture

### Organized Structure
```
app/components/
├── ui/              # Reusable UI components
│   ├── CheckButton.js      # Smart button that calls correct API based on tab
│   ├── StyledComponents.js # Material-UI styled components
│   └── TabPanel.js         # Tab content wrapper
├── combo/           # COMBO-specific components
│   ├── ComboTab.js         # Complete COMBO tab content
│   ├── ComboPlayInfo.js    # COMBO play generation UI
│   └── ComboDrawsList.js   # COMBO results display
├── straight/        # STRAIGHT-specific components
│   ├── StraightTab.js      # Complete STRAIGHT tab content
│   ├── StraightPlayInfo.js # STRAIGHT play generation UI
│   └── StraightDrawsList.js # STRAIGHT results display
└── shared/          # Components used by both game types
    ├── Analysis.js         # Statistical analysis display
    ├── FireballAnalysis.js # Fireball number analysis
    ├── StatsDisplay.js     # General statistics display
    └── PostCreationButtons.js # Admin controls
```

### Services Layer
```javascript
// app/services/playService.js
export const playCombo = async () => { /* calls /api/play/combo */ }
export const playStraight = async () => { /* calls /api/play/straight */ }
export const checkComboDraws = async () => { /* calls /api/test/combo */ }
export const checkStraightDraws = async () => { /* calls /api/test/straight */ }

// app/services/displayService.js
export const setComboDisplayInfo = async () => { /* calls /api/display/combo/create */ }
export const getComboDisplayInfo = async () => { /* calls /api/display/combo/get */ }
export const setStraightDisplayInfo = async () => { /* calls /api/display/straight/create */ }
export const getStraightDisplayInfo = async () => { /* calls /api/display/straight/get */ }
```

## How It Works

### 1. User Interface
- **Tabs**: Switch between COMBO and STRAIGHT modes
- **Check Button**: Analyzes historical data based on active tab
- **Play Buttons**: Generate new number combinations (within each tab)
- **Stats Display**: Shows monthly passing rates and statistics (tab-specific)
- **Results Display**: Shows analysis results and generated numbers

### 2. Smart Tab Switching
The `CheckButton` component automatically calls the correct API based on active tab:
```javascript
if (tabValue === 0) {
  await checkComboDraws();  // COMBO analysis
} else {
  await checkStraightDraws(); // STRAIGHT analysis
}
```

### 3. Data Flow
1. **Initialization**: Load historical draws from Firebase
2. **User Action**: Click check/play buttons
3. **API Call**: Route to appropriate endpoint based on game type
4. **Analysis**: Process draws against validation rules
5. **Display**: Show results in tab-specific components

### 4. Number Generation
- **COMBO**: Generates 2 draws (BBA + BAA) ensuring no duplicate numbers across draws
- **STRAIGHT**: Generates 6 draws (all valid patterns) ensuring positional uniqueness

### 5. Historical Analysis
- Fetches draws from Firebase Firestore
- Applies game-specific validation rules
- Calculates pass rates, pattern distributions, and fireball analysis
- Returns comprehensive statistics

### 6. Monthly Statistics System
- **COMBO Stats**: Uses `sortedFirstNumber/SecondNumber/ThirdNumber` fields
- **STRAIGHT Stats**: Uses `originalFirstNumber/SecondNumber/ThirdNumber` fields
- **Database Storage**: Separate documents (`Jan-2025` vs `Jan-2025--unordered`)
- **StatsDisplay Component**: Shared UI component that displays different data based on tab

## Firebase Integration

### Draws Collection
- **Collection**: `draws`
- **Fields**: 
  - `sortedFirstNumber`, `sortedSecondNumber`, `sortedThirdNumber` (for COMBO)
  - `originalFirstNumber`, `originalSecondNumber`, `originalThirdNumber` (for STRAIGHT)
  - `fireball` (optional)
  - `index` (for ordering)
  - `drawMonth`, `year` (for filtering)

### Statistics Collection  
- **Collection**: `drawStats`
- **COMBO Documents**: `{month}-{year}` (e.g., "Jan-2025")
- **STRAIGHT Documents**: `{month}-{year}--unordered` (e.g., "Jan-2025--unordered")
- **Fields**: `totalDraws`, `totalPassed`, `percentage`, `fireballStats`, etc.

## State Management (Zustand)
- **posts**: Historical draw data
- **numbers**: Generated play numbers  
- **display**: Analysis results
- **checkLoading**: Loading states

## Development Tips

### Adding New Features
1. Determine if feature is COMBO-specific, STRAIGHT-specific, or shared
2. Place in appropriate component folder
3. Update relevant tab component to include new feature
4. Add API endpoints if backend changes needed

### Testing APIs
```bash
# Test COMBO analysis
curl -X GET http://localhost:3000/api/test/combo

# Test STRAIGHT analysis  
curl -X GET http://localhost:3000/api/test/straight

# Generate COMBO plays
curl -X POST http://localhost:3000/api/play/combo

# Generate STRAIGHT plays
curl -X POST http://localhost:3000/api/play/straight

# Create COMBO statistics
curl -X GET http://localhost:3000/api/display/combo/create

# Get COMBO statistics
curl -X GET http://localhost:3000/api/display/combo/get

# Create STRAIGHT statistics
curl -X GET http://localhost:3000/api/display/straight/create

# Get STRAIGHT statistics
curl -X GET http://localhost:3000/api/display/straight/get
```

### Running the Application
```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Production server
npm run lint   # Code linting
```

## Key Files to Know

### Frontend
- `app/page.js` - Main homepage (clean, organized)
- `app/components/ui/CheckButton.js` - Smart testing button
- `app/components/combo/ComboTab.js` - Complete COMBO tab
- `app/components/straight/StraightTab.js` - Complete STRAIGHT tab
- `app/components/shared/StatsDisplay.js` - Monthly statistics display

### Services
- `app/services/playService.js` - Play & testing API communication
- `app/services/displayService.js` - Statistics API communication

### API Endpoints
- `app/api/play/combo/route.js` - COMBO number generation
- `app/api/play/straight/route.js` - STRAIGHT number generation  
- `app/api/test/combo/route.js` - COMBO historical analysis
- `app/api/test/straight/route.js` - STRAIGHT historical analysis
- `app/api/display/combo/create/route.js` - COMBO stats generation
- `app/api/display/combo/get/route.js` - COMBO stats retrieval
- `app/api/display/straight/create/route.js` - STRAIGHT stats generation
- `app/api/display/straight/get/route.js` - STRAIGHT stats retrieval

## Complete API Ecosystem

Each game type now has its **complete, independent ecosystem**:

### COMBO Workflow
1. **Generate Numbers**: `/api/play/combo` → `playCombo()`
2. **Test Historical**: `/api/test/combo` → `checkComboDraws()`  
3. **Create Stats**: `/api/display/combo/create` → `setComboDisplayInfo()`
4. **Display Stats**: `/api/display/combo/get` → `getComboDisplayInfo()`

### STRAIGHT Workflow  
1. **Generate Numbers**: `/api/play/straight` → `playStraight()`
2. **Test Historical**: `/api/test/straight` → `checkStraightDraws()`
3. **Create Stats**: `/api/display/straight/create` → `setStraightDisplayInfo()`
4. **Display Stats**: `/api/display/straight/get` → `getStraightDisplayInfo()`

This architecture ensures clear separation of concerns, maintainable code, and easy feature additions for either game type.