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

    initializeElements() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.originalCanvas = document.getElementById('originalCanvas');
        this.processedCanvas = document.getElementById('processedCanvas');
        this.originalHistogramCanvas = document.getElementById('originalHistogram');
        this.processedHistogramCanvas = document.getElementById('processedHistogram');
        
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.processedCtx = this.processedCanvas.getContext('2d');
        this.originalHistogramCtx = this.originalHistogramCanvas.getContext('2d');
        this.processedHistogramCtx = this.processedHistogramCanvas.getContext('2d');

        this.minBrightness = document.getElementById('minBrightness');
        this.maxBrightness = document.getElementById('maxBrightness');
        this.minBrightnessValue = document.getElementById('minBrightnessValue');
        this.maxBrightnessValue = document.getElementById('maxBrightnessValue');
        
        this.windowSize = document.getElementById('windowSize');
        this.windowSizeValue = document.getElementById('windowSizeValue');
        this.alpha = document.getElementById('alpha');
        this.alphaValue = document.getElementById('alphaValue');
    }

    setupEventListeners() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Гистограммные методы
        document.getElementById('showHistogram').addEventListener('click', () => this.showHistogram());
        document.getElementById('equalizeHistogram').addEventListener('click', () => this.equalizeHistogram());
        document.getElementById('linearContrast').addEventListener('click', () => this.linearContrast());
        document.getElementById('equalizeRGB').addEventListener('click', () => this.equalizeRGB());
        document.getElementById('equalizeHSV').addEventListener('click', () => this.equalizeHSV());
        
        // Нелинейные фильтры
        document.getElementById('medianFilter').addEventListener('click', () => this.applyMedianFilter());
        document.getElementById('minFilter').addEventListener('click', () => this.applyMinFilter());
        document.getElementById('maxFilter').addEventListener('click', () => this.applyMaxFilter());
        document.getElementById('midpointFilter').addEventListener('click', () => this.applyMidpointFilter());
        document.getElementById('alphaTrimmedFilter').addEventListener('click', () => this.applyAlphaTrimmedFilter());
        document.getElementById('resetImage').addEventListener('click', () => this.resetImage());

        this.minBrightness.addEventListener('input', () => {
            this.minBrightnessValue.textContent = this.minBrightness.value;
        });

        this.maxBrightness.addEventListener('input', () => {
            this.maxBrightnessValue.textContent = this.maxBrightness.value;
        });

        this.windowSize.addEventListener('input', () => {
            this.windowSizeValue.textContent = this.windowSize.value;
        });

        this.alpha.addEventListener('input', () => {
            this.alphaValue.textContent = this.alpha.value;
        });
    }

    setupCanvases() {
        this.originalCanvas.width = 500;
        this.originalCanvas.height = 400;
        this.processedCanvas.width = 500;
        this.processedCanvas.height = 400;
        
        this.originalHistogramCanvas.width = 450;
        this.originalHistogramCanvas.height = 180;
        this.processedHistogramCanvas.width = 450;
        this.processedHistogramCanvas.height = 180;

        this.clearCanvases();
    }

    clearCanvases() {
        // Исправлено: используем прозрачный фон вместо белого
        this.originalCtx.clearRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        
        this.originalHistogramCtx.clearRect(0, 0, this.originalHistogramCanvas.width, this.originalHistogramCanvas.height);
        this.processedHistogramCtx.clearRect(0, 0, this.processedHistogramCanvas.width, this.processedHistogramCanvas.height);
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.processedImage = new Image();
                this.processedImage.src = img.src;
                
                this.drawImages();
                this.updateStatistics();
                this.calculateHistograms();
                this.drawHistograms();
            };
            img.onerror = () => {
                alert('Ошибка загрузки изображения');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            alert('Ошибка чтения файла');
        };
        reader.readAsDataURL(file);
    }

    drawImages() {
        if (!this.originalImage) return;

        this.clearCanvases();

        const scale = Math.min(
            this.originalCanvas.width / this.originalImage.width,
            this.originalCanvas.height / this.originalImage.height
        );
        
        const width = this.originalImage.width * scale;
        const height = this.originalImage.height * scale;
        const x = (this.originalCanvas.width - width) / 2;
        const y = (this.originalCanvas.height - height) / 2;

        this.originalCtx.drawImage(this.originalImage, x, y, width, height);
        this.processedCtx.drawImage(this.originalImage, x, y, width, height);
    }

    calculateHistograms() {
        if (!this.originalImage) return;

        const originalImageData = this.originalCtx.getImageData(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        this.originalHistogram = this.calculateBrightnessHistogram(originalImageData);
        
        const processedImageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        this.processedHistogram = this.calculateBrightnessHistogram(processedImageData);
    }

    calculateBrightnessHistogram(imageData) {
        const histogram = new Array(256).fill(0);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            histogram[brightness]++;
        }
        
        return histogram;
    }

    drawHistograms() {
        if (this.originalHistogram) {
            this.drawHistogram(this.originalHistogramCtx, this.originalHistogram, '#3498db');
        }
        if (this.processedHistogram) {
            this.drawHistogram(this.processedHistogramCtx, this.processedHistogram, '#e74c3c');
        }
    }

    drawHistogram(ctx, histogram, color) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const maxCount = Math.max(...histogram);
        const barWidth = width / 256;
        
        ctx.fillStyle = color;
        
        for (let i = 0; i < 256; i++) {
            const barHeight = (histogram[i] / maxCount) * height;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
        }
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);
    }

    showHistogram() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }
        this.calculateHistograms();
        this.drawHistograms();
    }

    equalizeHistogram() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }

        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const data = imageData.data;
        
        const histogram = this.calculateBrightnessHistogram(imageData);
        const cumulativeHistogram = this.calculateCumulativeHistogram(histogram);
        const totalPixels = this.processedCanvas.width * this.processedCanvas.height;
        
        const equalizationMap = new Array(256);
        for (let i = 0; i < 256; i++) {
            equalizationMap[i] = Math.round((cumulativeHistogram[i] / totalPixels) * 255);
        }
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            const newBrightness = equalizationMap[brightness];
            
            const ratio = newBrightness / (brightness || 1);
            data[i] = Math.min(255, Math.max(0, r * ratio));
            data[i + 1] = Math.min(255, Math.max(0, g * ratio));
            data[i + 2] = Math.min(255, Math.max(0, b * ratio));
        }
        
        this.processedCtx.putImageData(imageData, 0, 0);
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    equalizeRGB() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }

        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const data = imageData.data;
        
        const histograms = {
            r: new Array(256).fill(0),
            g: new Array(256).fill(0),
            b: new Array(256).fill(0)
        };
        
        for (let i = 0; i < data.length; i += 4) {
            histograms.r[data[i]]++;
            histograms.g[data[i + 1]]++;
            histograms.b[data[i + 2]]++;
        }
        
        const cumulative = {
            r: this.calculateCumulativeHistogram(histograms.r),
            g: this.calculateCumulativeHistogram(histograms.g),
            b: this.calculateCumulativeHistogram(histograms.b)
        };
        
        const totalPixels = this.processedCanvas.width * this.processedCanvas.height;
        const maps = {
            r: cumulative.r.map(val => Math.round((val / totalPixels) * 255)),
            g: cumulative.g.map(val => Math.round((val / totalPixels) * 255)),
            b: cumulative.b.map(val => Math.round((val / totalPixels) * 255))
        };
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = maps.r[data[i]];
            data[i + 1] = maps.g[data[i + 1]];
            data[i + 2] = maps.b[data[i + 2]];
        }
        
        this.processedCtx.putImageData(imageData, 0, 0);
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    equalizeHSV() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }

        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const data = imageData.data;
        
        const vValues = [];
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            const max = Math.max(r, g, b);
            vValues.push(max);
        }
        
        const vHistogram = new Array(256).fill(0);
        vValues.forEach(v => vHistogram[Math.round(v * 255)]++);
        
        const cumulativeV = this.calculateCumulativeHistogram(vHistogram);
        const totalPixels = this.processedCanvas.width * this.processedCanvas.height;
        const vMap = cumulativeV.map(val => (val / totalPixels));
        
        let vIndex = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, v;
            
            v = max;
            
            const delta = max - min;
            if (delta === 0) {
                h = 0;
                s = 0;
            } else {
                s = delta / max;
                
                if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
                else if (max === g) h = (b - r) / delta + 2;
                else h = (r - g) / delta + 4;
                
                h /= 6;
            }
            
            v = vMap[Math.round(v * 255)];
            
            if (s === 0) {
                data[i] = data[i + 1] = data[i + 2] = Math.round(v * 255);
            } else {
                const hi = Math.floor(h * 6);
                const f = h * 6 - hi;
                const p = v * (1 - s);
                const q = v * (1 - f * s);
                const t = v * (1 - (1 - f) * s);
                
                let r, g, b;
                switch (hi) {
                    case 0: [r, g, b] = [v, t, p]; break;
                    case 1: [r, g, b] = [q, v, p]; break;
                    case 2: [r, g, b] = [p, v, t]; break;
                    case 3: [r, g, b] = [p, q, v]; break;
                    case 4: [r, g, b] = [t, p, v]; break;
                    case 5: [r, g, b] = [v, p, q]; break;
                }
                
                data[i] = Math.round(r * 255);
                data[i + 1] = Math.round(g * 255);
                data[i + 2] = Math.round(b * 255);
            }
        }
        
        this.processedCtx.putImageData(imageData, 0, 0);
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    linearContrast() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }

        const minInput = parseInt(this.minBrightness.value);
        const maxInput = parseInt(this.maxBrightness.value);
        
        if (minInput >= maxInput) {
            alert('Минимальное значение должно быть меньше максимального');
            return;
        }
        
        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            data[i] = this.linearTransform(r, minInput, maxInput);
            data[i + 1] = this.linearTransform(g, minInput, maxInput);
            data[i + 2] = this.linearTransform(b, minInput, maxInput);
        }
        
        this.processedCtx.putImageData(imageData, 0, 0);
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    linearTransform(value, minInput, maxInput) {
        if (value <= minInput) {
            return 0;
        } else if (value >= maxInput) {
            return 255;
        } else {
            return Math.round(((value - minInput) / (maxInput - minInput)) * 255);
        }
    }

    // НЕЛИНЕЙНЫЕ ФИЛЬТРЫ НА ОСНОВЕ ПОРЯДКОВЫХ СТАТИСТИК
    
    applyMedianFilter() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }
        
        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const processedData = this.applyNonLinearFilter(imageData, 'median');
        this.processedCtx.putImageData(processedData, 0, 0);
        
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    applyMinFilter() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }
        
        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const processedData = this.applyNonLinearFilter(imageData, 'min');
        this.processedCtx.putImageData(processedData, 0, 0);
        
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    applyMaxFilter() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }
        
        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const processedData = this.applyNonLinearFilter(imageData, 'max');
        this.processedCtx.putImageData(processedData, 0, 0);
        
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    applyMidpointFilter() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }
        
        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const processedData = this.applyNonLinearFilter(imageData, 'midpoint');
        this.processedCtx.putImageData(processedData, 0, 0);
        
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    applyAlphaTrimmedFilter() {
        if (!this.originalImage) {
            alert('Сначала загрузите изображение');
            return;
        }
        
        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const processedData = this.applyNonLinearFilter(imageData, 'alphaTrimmed');
        this.processedCtx.putImageData(processedData, 0, 0);
        
        this.calculateHistograms();
        this.drawHistograms();
        this.updateStatistics();
    }

    applyNonLinearFilter(imageData, filterType) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const result = new ImageData(width, height);
        const resultData = result.data;
        
        const windowSize = parseInt(this.windowSize.value);
        const halfWindow = Math.floor(windowSize / 2);
        const alpha = parseInt(this.alpha.value);
        
        // Копируем исходные данные
        for (let i = 0; i < data.length; i++) {
            resultData[i] = data[i];
        }
        
        // Обрабатываем каждый пиксель (кроме границ)
        for (let y = halfWindow; y < height - halfWindow; y++) {
            for (let x = halfWindow; x < width - halfWindow; x++) {
                const index = (y * width + x) * 4;
                
                // Собираем значения из окрестности для каждого канала
                const rValues = [];
                const gValues = [];
                const bValues = [];
                
                for (let wy = -halfWindow; wy <= halfWindow; wy++) {
                    for (let wx = -halfWindow; wx <= halfWindow; wx++) {
                        const neighborIndex = ((y + wy) * width + (x + wx)) * 4;
                        rValues.push(data[neighborIndex]);
                        gValues.push(data[neighborIndex + 1]);
                        bValues.push(data[neighborIndex + 2]);
                    }
                }
                
                // Применяем выбранный фильтр к каждому каналу
                switch(filterType) {
                    case 'median':
                        resultData[index] = this.getMedian(rValues);
                        resultData[index + 1] = this.getMedian(gValues);
                        resultData[index + 2] = this.getMedian(bValues);
                        break;
                        
                    case 'min':
                        resultData[index] = Math.min(...rValues);
                        resultData[index + 1] = Math.min(...gValues);
                        resultData[index + 2] = Math.min(...bValues);
                        break;
                        
                    case 'max':
                        resultData[index] = Math.max(...rValues);
                        resultData[index + 1] = Math.max(...gValues);
                        resultData[index + 2] = Math.max(...bValues);
                        break;
                        
                    case 'midpoint':
                        resultData[index] = this.getMidpoint(rValues);
                        resultData[index + 1] = this.getMidpoint(gValues);
                        resultData[index + 2] = this.getMidpoint(bValues);
                        break;
                        
                    case 'alphaTrimmed':
                        resultData[index] = this.getAlphaTrimmedMean(rValues, alpha);
                        resultData[index + 1] = this.getAlphaTrimmedMean(gValues, alpha);
                        resultData[index + 2] = this.getAlphaTrimmedMean(bValues, alpha);
                        break;
                }
                
                // Сохраняем альфа-канал
                resultData[index + 3] = data[index + 3];
            }
        }
        
        return result;
    }

    getMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
        } else {
            return sorted[mid];
        }
    }

    getMidpoint(values) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        return Math.round((min + max) / 2);
    }

    getAlphaTrimmedMean(values, alpha) {
        const sorted = [...values].sort((a, b) => a - b);
        const trimmed = sorted.slice(alpha, sorted.length - alpha);
        
        if (trimmed.length === 0) {
            return values[0];
        }
        
        const sum = trimmed.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / trimmed.length);
    }

    calculateCumulativeHistogram(histogram) {
        const cumulative = new Array(256);
        cumulative[0] = histogram[0];
        
        for (let i = 1; i < 256; i++) {
            cumulative[i] = cumulative[i - 1] + histogram[i];
        }
        
        return cumulative;
    }

    updateStatistics() {
        if (!this.originalImage) return;

        const imageData = this.processedCtx.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        const histogram = this.calculateBrightnessHistogram(imageData);
        
        let sum = 0;
        let sumSquared = 0;
        let totalPixels = this.processedCanvas.width * this.processedCanvas.height;
        
        for (let i = 0; i < 256; i++) {
            sum += i * histogram[i];
            sumSquared += i * i * histogram[i];
        }
        
        const mean = sum / totalPixels;
        const variance = (sumSquared / totalPixels) - (mean * mean);
        const stdDev = Math.sqrt(variance);
        
        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            const probability = histogram[i] / totalPixels;
            if (probability > 0) {
                entropy -= probability * Math.log2(probability);
            }
        }
        
        document.getElementById('imageSize').textContent = `${this.processedCanvas.width} × ${this.processedCanvas.height}`;
        document.getElementById('meanBrightness').textContent = mean.toFixed(2);
        document.getElementById('stdDeviation').textContent = stdDev.toFixed(2);
        document.getElementById('entropy').textContent = entropy.toFixed(4);
    }

    resetImage() {
        if (this.originalImage) {
            this.drawImages();
            this.calculateHistograms();
            this.drawHistograms();
            this.updateStatistics();
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.imageProcessor = new ImageProcessor();
});