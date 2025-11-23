# Image Processing Lab 3

WEB application for digital image processing implementing histogram analysis and contrast enhancement methods.

## Functions that are required

- Построение гистограммы изображения
- Эквализация гистограммы 
- Линейное контрастирование
- Сравнение методов эквализации в RGB и HSV пространствах
- Визуализация результатов обработки
- Статистический анализ изображений

# 1 General Description

## 1.1 Main Features

"Image Processor" is a web application for analyzing and enhancing digital images using histogram-based methods.

The program allows you to:
- Build and visualize image histograms
- Apply histogram equalization for contrast enhancement
- Perform linear contrast stretching
- Compare RGB and HSV equalization approaches
- Analyze image statistics (mean, standard deviation, entropy)
- Process multiple images with drag-and-drop interface

## 1.2 Processing Methods

### Histogram Analysis
**Purpose:** Visualize pixel intensity distribution  
**Components:**
- Brightness histogram (0-255 levels)
- Cumulative distribution function
- Real-time histogram updates

### Histogram Equalization
**Algorithm:** Redistributes pixel intensities to create uniform histogram  
**Variants:**
- Standard equalization (brightness-based)
- RGB equalization (per-channel processing)
- HSV equalization (value component only)

### Linear Contrast Stretching
**Algorithm:** Linear mapping of intensity ranges  
**Parameters:**
- Minimum brightness threshold (0-255)
- Maximum brightness threshold (0-255)
- Dynamic range expansion

# 2 User Guide

## 2.1 Application Launch

The application is a web page and can be launched in the following ways:
- Opening the `index.html` file in any modern browser
- Hosting on a web server and accessing via URL
- No dependencies or installation required

## 2.2 Main Interface Elements

**Upload Section:**
- Drag-and-drop area for easy file selection
- File input button for traditional file selection
- Test image gallery for quick access to sample images
- Progress indicators during processing

**Control Panel:**
- Histogram display button
- Equalization methods: Standard, RGB, HSV
- Linear contrast controls with sliders
- Reset functionality to restore original image

**Image Comparison Area:**
- Side-by-side display of original and processed images
- Real-time visual feedback
- Canvas-based rendering for high performance

**Histogram Visualization:**
- Dual histogram display (before/after processing)
- Color-coded graphs (blue for original, red for processed)
- Interactive scaling and rendering

**Statistics Panel:**
- Image dimensions and size
- Mean brightness value
- Standard deviation of intensities
- Information entropy calculation

## Working with the Application

**Loading Images:**
- **Drag and Drop:** Drag image files directly to upload area
- **File Selection:** Click upload area to open file dialog
- **Test Images:** Click on sample images for quick testing

**Applying Processing:**
- **Histogram Analysis:** Click "Построить гистограмму" to visualize current state
- **Equalization Methods:** Choose between standard, RGB, or HSV approaches
- **Linear Contrast:** Adjust sliders and apply linear transformation
- **Reset:** Revert to original image at any time

**Operation Features:**
- Real-time processing with immediate visual feedback
- Synchronized histogram updates
- Statistical recalculations after each operation
- Responsive design for various screen sizes

# Chapter 3 Application Code Structure and Architecture

## 3.1 Project Structure

The application uses a single-file architecture with embedded CSS and JavaScript:

```
ImageProcessor/
├── index.html          # Complete application (HTML + CSS + JavaScript)
├── images/             # Test images directory
│   ├── low_contrast1.jpg
│   ├── low_contrast2.jpg
│   └── dark_image.jpg
└── README.md           # Documentation
```

## 3.2 Component Interaction

```
User Interface (HTML/CSS)
         ↑
         | User Events & File API
         ↓
    ImageProcessor Class
         ↑
         | Canvas API & ImageData
         ↓
Processing Algorithms (Histogram/Contrast/Equalization)
```

## 3.3 Code Analysis

**Main ImageProcessor Class:**

```javascript
class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.processedImage = null;
        this.originalHistogram = null;
        this.processedHistogram = null;
        this.initializeElements();
        this.setupEventListeners();
        this.setupCanvases();
    }
}
```

**Core Processing Algorithms:**

**Histogram Calculation:**
```javascript
calculateBrightnessHistogram(imageData) {
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
        const brightness = Math.round(0.299*r + 0.587*g + 0.114*b);
        histogram[brightness]++;
    }
    return histogram;
}
```

**Linear Contrast Stretching:**
```javascript
linearTransform(value, minInput, maxInput) {
    if (value <= minInput) return 0;
    if (value >= maxInput) return 255;
    return Math.round(((value - minInput) / (maxInput - minInput)) * 255);
}
```

**Histogram Equalization:**
```javascript
// Standard equalization - brightness-based
const equalizationMap = cumulativeHistogram.map(val => 
    Math.round((val / totalPixels) * 255)
);

// RGB equalization - per-channel processing
data[i] = maps.r[data[i]];     // Red channel
data[i+1] = maps.g[data[i+1]]; // Green channel  
data[i+2] = maps.b[data[i+2]]; // Blue channel

// HSV equalization - value component only
v = vMap[Math.round(v * 255)]; // Equalize only Value
```

**Real-time Processing Pipeline:**

```javascript
processImage(method) {
    const imageData = this.getImageData();
    switch(method) {
        case 'equalize':
            this.applyHistogramEqualization(imageData);
            break;
        case 'linearContrast':
            this.applyLinearContrast(imageData);
            break;
        case 'equalizeRGB':
            this.applyRGBEqualization(imageData);
            break;
        case 'equalizeHSV':
            this.applyHSVEqualization(imageData);
            break;
    }
    this.updateDisplay(imageData);
    this.updateStatistics();
}
```

## 3.4 Algorithm Implementation Details

### Histogram Equalization Mathematics

**Cumulative Distribution Function:**
```
C(i) = Σ histogram[j] for j=0 to i
```

**Equalization Transformation:**
```
h(v) = round((C(v) / total_pixels) * 255)
```

### Linear Contrast Formula

**Intensity Mapping:**
```
new_value = ((old_value - min_input) / (max_input - min_input)) * 255
```

### Color Space Conversions

**RGB to HSV Conversion:**
```
V = max(R, G, B)
S = (max - min) / max
H = hue calculation based on dominant channel
```

**HSV to RGB Conversion:**
```
Based on hue sector and saturation/value parameters
```

## 3.5 Problems and Solutions

### Solved Problems:

**1. Canvas Image Data Manipulation**
- *Problem:* Direct pixel manipulation performance issues
- *Solution:* Optimized ImageData processing with typed arrays

**2. Real-time Histogram Updates**
- *Problem:* Frequent histogram recalculations causing lag
- *Solution:* Cached histogram data with incremental updates

**3. Color Space Accuracy**
- *Problem:* Precision loss in HSV conversions
- *Solution:* High-precision floating point calculations with proper clamping

**4. Large Image Handling**
- *Problem:* Memory issues with high-resolution images
- *Solution:* Canvas size limiting with aspect ratio preservation

**5. Cross-browser File API Compatibility**
- *Problem:* Inconsistent FileReader behavior across browsers
- *Solution:* Comprehensive error handling and fallback mechanisms

### Technical Challenges Overcome:

**1. Histogram Equalization Optimization**
- Implemented efficient cumulative histogram calculation
- Used mapping tables for fast pixel transformations
- Optimized loop structures for JavaScript performance

**2. Linear Contrast Precision**
- Accurate range mapping with proper integer rounding
- Boundary condition handling for extreme values
- Real-time slider feedback with immediate application

**3. HSV Color Space Accuracy**
- Correct hue calculation for all color sectors
- Proper saturation and value normalization
- Accurate inverse transformation to RGB

## 3.6 Performance Considerations

- **Memory Efficiency:** Single ImageData object reuse
- **Processing Speed:** Optimized pixel iteration loops
- **Visual Feedback:** Immediate canvas updates
- **Resource Management:** Proper garbage collection handling

# 4 Technologies and Implementation

## Core Technologies

**Frontend Framework:**
- Pure HTML5, CSS3, and Vanilla JavaScript
- Canvas API for image manipulation
- File API for client-side file handling
- CSS Grid and Flexbox for responsive layout

**Key Algorithms Implemented:**
- Histogram analysis and equalization
- Linear contrast stretching
- RGB/HSV color space conversions
- Statistical analysis (mean, std dev, entropy)

**Performance Optimizations:**
- Efficient pixel data processing
- Cached histogram calculations
- Optimized rendering pipelines
- Memory-efficient image handling

## Educational Value

This implementation demonstrates:
- Digital image processing fundamentals
- Histogram-based enhancement techniques
- Color space transformations
- Real-time web application development
- Algorithm optimization strategies

## Browser Compatibility

Tested and verified in:
- Chrome 90+ (Full support)
- Firefox 88+ (Full support) 
- Safari 14+ (Full support)
- Edge 90+ (Full support)

## Author's Information
Contact: sasha0koshel@gmail.com

## License
This project is developed for educational purposes as part of BSU Computer Graphics curriculum.