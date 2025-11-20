# computer-graphics
Repository with labs of BSU student in Programming Conputer Graphics

# 1. color-converter(variant 5)
WEB-app for converting and selecting colors in different models: 
CMYK, LAB and HSV.

## Functions that are required

- Конвертация между моделями CMYK ↔ LAB ↔ HSV
- Три способа задания цвета в каждой модели:
  - Ползунки
  - Числовые поля ввода
  - Color picker
- Автоматический пересчет при изменении любого параметра
- Визуальное отображение цвета
- Предупреждения о некорректных значениях
(Sorry for some Russian just copy-pasted the requirements)

# 1 General Description

## 1.1 Main Features

"Color Converter" is a web application for working with colors in various color models.

The program allows you to:
- Convert between color models: CMYK, LAB, and HSV
- Visualize the selected color in real time
- Use three input methods: sliders, numeric fields, and color picker
- Automatically synchronize changes between all models
- Receive notifications about value adjustments

## 1.2 Color Models

### CMYK Model
**Model Type:** Subtractive (color is formed by subtracting from white)  
**Components:**
- C (Cyan) - 0-100%
- M (Magenta) - 0-100%
- Y (Yellow) - 0-100%
- K (Key/Black) - 0-100%

**Application:** Printing, publishing  
**Features in the application:** Percentage values, automatic black component calculation

### LAB Model
**Model Type:** Device-independent, uniform color space  
**Components:**
- L (Lightness) - 0-100 (brightness)
- A - -128 to +127 (green-red axis)
- B - -128 to +127 (blue-yellow axis)

**Application:** Scientific research, colorimetry  
**Features in the application:** Negative values for A and B components

### HSV Model
**Model Type:** Cylindrical (based on human perception)  
**Components:**
- H (Hue) - 0°-360° (color wheel)
- S (Saturation) - 0%-100% (color intensity)
- V (Value) - 0%-100% (brightness)

**Application:** Graphic editors, design  
**Features in the application:** Cyclic nature of hue

# 2 User Guide

## 2.1 Application Launch

The application is a web page and can be launched in the following ways:
- Opening the `index.html` file in any modern browser
- Hosting on a web server and accessing via URL

## 2.2 Main Interface Elements

**Color Preview Area:**
- Located at the top of the interface
- Displays the currently selected color as a rectangle
- Shows HEX color representation

**Color Picker:**
- Standard HTML5 color picker element
- Allows quick selection of any color from the palette

**CMYK Panel:**
- Four components: Cyan, Magenta, Yellow, Black
- For each component:
  - Slider for visual adjustment (0-100%)
  - Numeric field for precise input
  - Current value display

**LAB Panel:**
- Three components: Lightness, A, B
- For each component:
  - Slider with appropriate ranges
  - Numeric field for precise input
  - Current value display

**HSV Panel:**
- Three components: Hue, Saturation, Value
- For each component:
  - Slider with appropriate ranges
  - Numeric field for precise input
  - Current value display

**Notification System:**
- Displays warnings about value adjustments
- Automatically hides after 3 seconds

## Working with the Application

**Changing Colors:**
- **Using Sliders:** Drag sliders in any panel
- **Using Numeric Fields:** Enter values in input fields (requires additional actions to apply)
- **Using Color Picker:** Select color from standard palette

**Operation Features:**
- When changing a value in one model, values in other models are automatically recalculated
- All interface elements are synchronized with each other
- Notifications appear for significant rounding adjustments

# Chapter 3 Application Code Structure and Architecture

## 3.1 Project Structure

The application is built using a classical scheme with separation of presentation and logic layers:

```
ColorConverter/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # Interface styling
└── js/
    └── converter.js    # Business logic and conversions
```

## 3.2 Component Interaction

```
User Interface (HTML)
         ↑
         | JavaScript Events
         ↓
    ColorConverter Class
         ↑
         | Mathematical Transformations
         ↓
Color Spaces (CMYK/LAB/HSV)
```

## 3.3 Code Analysis

**Main ColorConverter Class:**

```javascript
class ColorConverter {
    constructor() {
        this.warningShown = false;
        this.updating = false;
        this.initEventListeners();
        this.updateFromRGB(255, 255, 255);
    }
}
```

**Conversion Algorithms:**

Conversion between models is performed through intermediate RGB space:

1. **CMYK → RGB → LAB/HSV**
2. **LAB → XYZ → RGB → CMYK/HSV**  
3. **HSV → RGB → CMYK/LAB**

**Key Conversion Methods:**

- `rgbToCMYK()` / `cmykToRGB()` - conversions between RGB and CMYK
- `rgbToHSV()` / `hsvToRGB()` - conversions between RGB and HSV  
- `rgbToLAB()` / `labToRGB()` - conversions between RGB and LAB (via XYZ)
- `rgbToXYZ()` / `xyzToRGB()` - basic conversions for LAB

**Interface Update Mechanism:**

```javascript
updateAllModels(rgb) {
    this.updating = true;
    this.updateColorPreview(rgb);
    const cmyk = this.rgbToCMYK(rgb.r, rgb.g, rgb.b);
    const lab = this.rgbToLAB(rgb.r, rgb.g, rgb.b);
    const hsv = this.rgbToHSV(rgb.r, rgb.g, rgb.b);
    this.updateModelUI('cmyk', cmyk);
    this.updateModelUI('lab', lab);
    this.updateModelUI('hsv', hsv);
    this.updating = false;
}
```

## 3.4 Problems and Solutions

### Solved Problems:

**1. Synchronization Between Sliders and Visual Representation**
- *Problem:* Interface could lag during fast slider movement
- *Solution:* Added `updating` flag to prevent recursive updates

**2. Conversion Between Color Spaces**
- *Problem:* Complex mathematical transformations between LAB and RGB via XYZ
- *Solution:* Implementation of precise algorithms considering gamma correction and reference white point values

**3. Input Data Validation**
- *Problem:* User input could contain incorrect values
- *Solution:* Added `validateInputValue()` function for boundary value checking

**4. Warning Display**
- *Problem:* Unobtrusive user notification about adjustments
- *Solution:* Notification system with automatic hiding after 3 seconds

### Unsolved Problems:

**1. Manual Input in Numeric Fields**
- *Problem:* Values from numeric fields are not automatically applied during manual input
- *Current Status:* Requires additional user actions (focus change or Enter key press) to apply values

**2. Boundary Value Handling in LAB Space**
- *Problem:* Some LAB value combinations may exceed visible color space boundaries
- *Current Status:* Partial validation without complete solution for color achievability problem

**3. Performance During Frequent Updates**
- *Problem:* Multiple recalculations during fast slider movement
- *Current Status:* Decision made in favor of instant response at the expense of optimization

# 4 Technologies that I implemented

I have chosen to develop a WEB-app because it doesn't requires instalation of some IDE(actually I used VSC for coding) and compilers/.

List of technologies:
- HTML, CSS, JavaScript
- Deepseek(I used LLM for making app more convinient and well designed(CSS))
- Obsidian(This README.md written in Obsidian)

## Author's info
mail to contact with me: sasha0koshel@gmail.com

## PS
Hah, this README file has been written mostly in English cause I type in Russian too slowly, so it`s faster for me to make my documentation in English.