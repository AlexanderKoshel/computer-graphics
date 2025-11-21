# # computer-graphics

Repository with labs of BSU student in Programming Conputer Graphics
# Graphic File Analyzer - Lab 2

WEB application for reading and analyzing data from graphic file formats.

## Functions that are required

- Reading basic information from graphic files (up to 100,000 files)
- Support for formats: JPG, GIF, TIF, BMP, PNG, PCX
- Display of file information in table format:
  - File name
  - Image size (pixels)
  - Resolution (DPI)
  - Color depth
  - Compression type
- Optional: Additional format-specific information
- Convenient interface with drag-and-drop support
- Performance optimization for large file sets

# 1 General Description

## 1.1 Main Features

"Graphic File Analyzer" is a web application for extracting and displaying data from image file formats.

The program allows you to:
- Analyze image formats without external libraries
- Extract technical information directly from file binary structures
- Handle large numbers of files efficiently
- Display results in a table format
- Support drag-and-drop file uploads
- Show processing progress and statistics

## 1.2 Supported Formats

### JPEG Format
**File Signature:** FF D8 FF  
**Information Extracted From:**
- SOF (Start of Frame) segment for dimensions
- APP0 (JFIF) segment for resolution
- Compression type from format specification

### PNG Format  
**File Signature:** 89 50 4E 47 0D 0A 1A 0A
**Information Extracted From:**
- IHDR chunk for dimensions and color depth
- pHYs chunk for resolution
- Compression from format specification

### GIF Format
**File Signature:** GIF87a or GIF89a
**Information Extracted From:**
- Logical Screen Descriptor for dimensions
- Packed field for color information
- Compression from format specification

### BMP Format
**File Signature:** BM (42 4D)
**Information Extracted From:**
- BITMAPINFOHEADER or BITMAPCOREHEADER
- Resolution from pixels-per-meter fields

### TIFF Format
**File Signature:** II (little-endian) or MM (big-endian)
**Information Extracted From:**
- Image File Directory (IFD) entries
- Specific tags for dimensions, resolution, compression

### PCX Format
**File Signature:** 0x0A
**Information Extracted From:**
- 128-byte header structure
- Resolution and color depth fields

# 2 User Guide

## 2.1 Application Launch

The application is a web page and can be launched in the following ways:
- Opening the `index.html` file in any modern browser
- Hosting on a web server and accessing via URL
- No installation or dependencies required

## 2.2 Main Interface Elements

**Upload Section:**
- Drag-and-drop area for easy file selection
- File input button for traditional file selection
- Folder path input (for demonstration purposes)
- Progress bar showing processing status
- File counter displaying processing progress

**Results Table:**
- File name with emphasis
- Image dimensions in pixels (width × height)
- Resolution in DPI (dots per inch)
- Color depth in bits
- Compression algorithm used
- Additional format-specific information

**Statistics Panel:**
- Total files processed
- Combined file size
- Processing time in milliseconds

**Notification System:**
- Error messages for unsupported formats
- Processing status updates
- File format detection results

# 3. Structure and Architecture

## 3.1 Project Structure

The application uses a single-file architecture for simplicity and portability:

```
GraphicFileAnalyzer/
├── index.html          # HTML5 include interface of app
├── css/style.css       # CSS info about interface elements
├── app.js              # Code on JavaScript that grabs data from binary files
└── README.md           # This documentation file
```

## 3.2 Component Interaction

```
User Interface (HTML/CSS)
         ↑
         | File API Events
         ↓
    File Processing Engine
         ↑
         | Binary Data Parsing
         ↓
Format-Specific Parsers (JPEG/PNG/GIF/etc.)
```

## 3.3 Code Analysis

**Main Processing Flow:**

```javascript
function handleFiles(files) {
    // Process each file using FileReader API
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileInfo = extractFileInfo(file, e.target.result);
            displayFileInfo(fileInfo);
        };
        reader.readAsArrayBuffer(file);
    }
}
```

**File Type Detection:**

```javascript
function detectFileType(dataView) {
    // Check file signatures (magic numbers)
    if (dataView.getUint16(0) === 0xFFD8) return 'JPEG';
    if (dataView.getUint32(0) === 0x89504E47) return 'PNG';
    // ... other format detection
}
```

**Format-Specific Parsing:**

- **JPEG:** SOF and APP0 segment parsing
- **PNG:** IHDR and pHYs chunk reading  
- **GIF:** Logical Screen Descriptor analysis
- **BMP:** Header structure interpretation
- **TIFF:** IFD entry processing
- **PCX:** 128-byte header parsing

**Key Extraction Methods:**

- `extractJPEGInfo()` - Parses JPEG segments for metadata
- `extractPNGInfo()` - Reads PNG chunks for technical data
- `extractGIFInfo()` - Analyzes GIF header and color table
- `extractBMPInfo()` - Interprets BMP header structures
- `extractTIFFInfo()` - Processes TIFF IFD entries
- `extractPCXInfo()` - Reads PCX header information

## 3.4 Problems and Solutions

### Solved Problems:

**1. Binary File Parsing in Browser**
- *Problem:* JavaScript limitations in binary data manipulation
- *Solution:* Used DataView interface for precise byte-level access

**2. Format Detection**
- *Problem:* Reliable identification of file formats
- *Solution:* Implemented signature-based detection using magic numbers

**3. Large File Handling**
- *Problem:* Memory issues with multiple large files
- *Solution:* Progressive processing and efficient ArrayBuffer usage

**4. Cross-Format Consistency**
- *Problem:* Different metadata storage across formats
- *Solution:* Unified extraction interface with format-specific parsers

### Technical Challenges:

**1. JPEG Segment Parsing**
- *Challenge:* Variable-length segments with different markers
- *Solution:* Iterative parsing with length-based navigation

**2. TIFF Endianness Handling**
- *Challenge:* Support for both little-endian and big-endian formats
- *Solution:* Dynamic endianness detection and appropriate DataView methods

**3. Resolution Unit Conversion**
- *Challenge:* Different units across formats (pixels per meter, DPI, etc.)
- *Solution:* Standardized conversion to DPI for consistent display

# 4 Technologies Used

I developed this as a web application to ensure cross-platform compatibility and easy deployment.

**Core Technologies:**
- HTML5 for structure and file input elements
- CSS3 for modern, responsive interface design
- Vanilla JavaScript for binary file processing
- FileReader API for client-side file access
- DataView interface for binary data manipulation

**Key Features:**
- Zero dependencies - no external libraries required
- Client-side processing - no server uploads needed
- Progressive enhancement - works in modern browsers
- Responsive design - adapts to different screen sizes

## Performance Considerations

- Efficient binary parsing minimizes memory usage
- Progressive display updates during processing
- Format-specific optimizations for faster analysis
- Limited file size processing to prevent browser crashes

## Author's Information
Contact: sasha0koshel@gmail.com

## Browser Compatibility
Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+