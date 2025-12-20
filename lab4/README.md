# computer-graphics

Repository with labs of BSU student in Programming Computer Graphics

# 4. raster-algorithms

WEB-app for visualizing basic rasterization algorithms: step-by-step, DDA, Bresenham's line, and Bresenham's circle.

## Functions that are required

- Visualization of 4 rasterization algorithms:
  - Step-by-step algorithm
  - DDA algorithm
  - Bresenham's line algorithm
  - Bresenham's circle algorithm
- Coordinate system with axes, grid, and labels
- Three ways to input parameters:
  - Sliders for coordinates
  - Numeric input fields
  - Direct canvas clicking
- Step-by-step visualization with calculations
- Performance comparison between algorithms
- Real-time scaling and grid adjustment

# 1 General Description

## 1.1 Main Features

"Raster Algorithms Visualizer" is a web application for studying and comparing basic rasterization algorithms.

The program allows you to:
- Visualize how each algorithm draws lines and circles
- See step-by-step execution with detailed calculations
- Compare performance between different algorithms
- Adjust scale and grid for better understanding
- Input coordinates via sliders, fields, or direct clicking
- See real-time coordinate information

## 1.2 Algorithms

### Step-by-Step Algorithm
**Type:** Basic rasterization  
**How it works:**
- Calculates Δx and Δy between points
- Takes max(|Δx|, |Δy|) steps
- Adds equal increments each step
- Rounds coordinates to nearest pixel

**Features:** Simple, uses floating-point math, good for learning

### DDA Algorithm (Digital Differential Analyzer)
**Type:** Improved step algorithm  
**How it works:**
- Similar to step-by-step but more accurate
- Uses better increment calculations
- Reduces rounding errors
- Still uses floating-point operations

**Features:** Better quality than basic step algorithm

### Bresenham's Line Algorithm
**Type:** Integer-only algorithm  
**How it works:**
- Uses only integer math (no floating-point)
- Based on decision parameter (err)
- Checks 2*err to decide next pixel
- Very efficient and fast

**Features:** Fast, integer-only, industry standard

### Bresenham's Circle Algorithm
**Type:** Circle drawing algorithm  
**How it works:**
- Uses 8-way symmetry (draws 8 points at once)
- Starts from (0, R) and moves inward
- Uses decision parameter d
- Integer-only operations

**Features:** Efficient circle drawing, uses symmetry

# 2 User Guide

## 2.1 Application Launch

The application is a web page and can be launched in the following ways:
- Opening the `index.html` file in any modern browser
- No installation or setup required
- Works offline after downloading

## 2.2 Main Interface Elements

**Control Panel (left side):**
- Algorithm selection (4 radio buttons)
- Coordinate inputs for lines (x1, y1, x2, y2)
- Circle inputs (center x, center y, radius)
- Action buttons: Draw, Step-by-step, Clear, Test Example
- Scale slider (0.5x to 3x)
- Display toggles: Grid, Axes, Calculations

**Visualization Area (center):**
- Canvas showing coordinate system
- Grid lines every 10 pixels
- X and Y axes with labels
- Drawn points in algorithm-specific colors
- Real-time coordinate display on mouse hover

**Information Panel (right side):**
- Current algorithm description and formulas
- Step-by-step calculations list
- Performance comparison table
- Usage hints and tips

**Step Controls (bottom):**
- Shows when in step-by-step mode
- Step navigation (previous/next/reset)
- Play/pause animation
- Speed control slider

## Working with the Application

**Drawing Shapes:**
- **Quick draw:** Select algorithm, enter coordinates, click "Draw"
- **Step-by-step:** Click "Step-by-step" button for detailed visualization
- **Test examples:** Click "Test Example" for predefined coordinates
- **Direct input:** Click on canvas to see coordinates, then use them

**Features:**
- Everything updates in real-time
- Calculations show exactly what happens each step
- Performance times are measured and compared
- Scale can be changed anytime without losing drawing

# Chapter 3 Application Code Structure and Architecture

## 3.1 Project Structure

The application is organized into clean, separate modules:

```
RasterAlgorithms/
├── index.html              # Main HTML structure
├── css/
│   ├── styles.css         # Interface styling
│   └── grid.css           # Grid and coordinate system styles
└── js/
    ├── main.js            # Entry point and coordination
    ├── algorithms.js      # All 4 algorithm implementations
    ├── canvas-manager.js  # Canvas drawing and grid system
    ├── ui-controls.js     # Button and input handling
    ├── performance.js     # Timing and comparison
    └── step-by-step.js    # Step visualization
```

## 3.2 Component Interaction

```
User Interface (HTML/CSS)
         ↑
         | User Events
         ↓
    Main Application
         ↑
         | Method Calls
         ↓
Algorithms → Canvas → Results
```

## 3.3 Code Analysis

**Main Application Class:**

```javascript
class MainApplication {
    constructor() {
        // Initialize all components
        this.algorithms = new RasterAlgorithms();
        this.canvasManager = new CanvasManager('mainCanvas');
        this.uiControls = new UIControls(this.canvasManager, this.algorithms);
        this.performance = new PerformanceMeasurer();
        this.visualizer = new StepByStepVisualizer(this.canvasManager, this.uiControls);
    }
}
```

**Key Algorithm Methods:**

All algorithms return points and calculations:

```javascript
// Example: Bresenham's line algorithm
bresenhamLine(x1, y1, x2, y2) {
    const points = [];
    const calculations = [];
    
    // Algorithm implementation...
    // Returns: {points: [...], calculations: [...], color: '#45B7D1'}
    
    return result;
}
```

**Canvas Drawing System:**

The canvas manager handles:
- Drawing coordinate system with grid
- Converting between screen and grid coordinates
- Drawing pixels at correct positions
- Managing scale and view

**Real-time Updates:**

When you change any setting:
1. UI captures the change
2. Algorithm calculates new points
3. Canvas updates the display
4. Performance is measured
5. Calculations are shown

## 3.4 Problems and Solutions

### Solved Problems:

**1. Grid and Pixel Alignment**
- *Problem:* Pixels didn't align perfectly with grid lines
- *Solution:* Added precise coordinate conversion functions that snap to grid

**2. Step-by-Step Animation**
- *Problem:* Fast animations skipped steps or looked choppy
- *Solution:* Implemented smooth timing control with adjustable speed

**3. Performance Measurement**
- *Problem:* Timing measurements were inconsistent
- *Solution:* Added warm-up runs and multiple iterations for accurate averages

**4. Canvas Scaling**
- *Problem:* Scaled grid looked blurry or misaligned
- *Solution:* Used integer-based scaling that preserves sharp grid lines

**5. Algorithm Accuracy**
- *Problem:* Some algorithms produced slightly wrong points
- *Solution:* Tested against mathematical proofs and fixed boundary cases

### Current Limitations:

**1. Large Coordinate Values**
- *Problem:* Very large coordinates can overflow or look messy
- *Workaround:* Limited input range to -100 to 100

**2. Mobile Touch Support**
- *Problem:* Touch interaction isn't as smooth as mouse
- *Status:* Basic touch works but could be improved

**3. Exporting Results**
- *Problem:* Can't save drawings or calculations easily
- *Status:* Copy calculations to clipboard works, but no image export

# 4 Technologies that I implemented

I chose to make a web app because it runs anywhere without installation - just open in a browser.

Technologies used:
- **HTML/CSS/JavaScript** - Core web technologies
- **Canvas API** - For drawing graphics and grid
- **Modern CSS** - Grid, Flexbox, variables for responsive design
- **ES6 Classes** - Organized code into reusable components
- **Performance API** - For accurate timing measurements

Development tools:
- **VS Code** - For writing and debugging code
- **Browser DevTools** - For testing and fixing issues
- **Git** - For version control
- **DeepSeek** - For help with complex algorithms and CSS design

## What worked well:
- The modular structure made debugging easier
- Canvas API was perfect for this type of visualization
- CSS Grid made the responsive layout simple
- Step-by-step visualization really helps understand the algorithms

## What could be better:
- Could add more algorithms (like Wu's anti-aliased lines)
- Mobile experience could be smoother
- Some advanced features like saving/loading states

## Author's info

Email: sasha0koshel@gmail.com

GitHub: [Your GitHub profile]

## PS

This documentation is in English because it's faster for me to type and it makes the project more accessible internationally. The app itself has Russian interface text for the lab requirements.