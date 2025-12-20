// js/canvas-manager.js
/**
 * Класс для управления Canvas и отрисовки
 */
class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scale = 1.0;
        this.gridSize = 10; // Размер сетки в пикселях
        this.gridEnabled = true;
        this.axesEnabled = true;
        this.isDarkMode = false;
        this.currentAlgorithm = null;
        this.points = [];
        this.currentStep = 0;
        this.isStepMode = false;
        
        // Размеры
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Цвета
        this.colors = {
            stepByStep: '#FF6B6B',
            dda: '#4ECDC4',
            bresenhamLine: '#45B7D1',
            bresenhamCircle: '#96CEB4',
            grid: '#E0E0E0',
            subgrid: '#F0F0F0',
            axes: '#333333',
            text: '#333333',
            background: '#FFFFFF',
            activePixel: '#000000',
            idealLine: 'rgba(0, 0, 0, 0.2)'
        };
        
        this.init();
    }
    
    init() {
        // Очищаем canvas
        this.clear();
        
        // Отрисовываем начальную сетку
        this.drawCoordinateSystem();
        
        // Добавляем обработчики событий
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    }
    
    /**
     * Очищает canvas
     */
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Отрисовывает систему координат
     */
    drawCoordinateSystem() {
        this.clear();
        
        if (this.gridEnabled) {
            this.drawGrid();
        }
        
        if (this.axesEnabled) {
            this.drawAxes();
        }
        
        // Если есть точки алгоритма, отрисовываем их
        if (this.points.length > 0) {
            this.drawPoints();
        }
    }
    
    /**
     * Отрисовывает сетку
     */
    drawGrid() {
        const scaledGridSize = this.gridSize * this.scale;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        this.ctx.strokeStyle = this.colors.subgrid;
        this.ctx.lineWidth = 0.5 / this.scale;
        
        // Вертикальные линии
        for (let x = halfWidth % scaledGridSize; x < this.width; x += scaledGridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // Горизонтальные линии
        for (let y = halfHeight % scaledGridSize; y < this.height; y += scaledGridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Основные линии сетки (каждые 5 линий)
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1 / this.scale;
        
        for (let x = halfWidth % (scaledGridSize * 5); x < this.width; x += scaledGridSize * 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = halfHeight % (scaledGridSize * 5); y < this.height; y += scaledGridSize * 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Отрисовывает оси координат
     */
    drawAxes() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        this.ctx.strokeStyle = this.colors.axes;
        this.ctx.lineWidth = 2 / this.scale;
        this.ctx.font = `${12 / this.scale}px Arial`;
        this.ctx.fillStyle = this.colors.text;
        
        // Ось X
        this.ctx.beginPath();
        this.ctx.moveTo(0, halfHeight);
        this.ctx.lineTo(this.width, halfHeight);
        this.ctx.stroke();
        
        // Ось Y
        this.ctx.beginPath();
        this.ctx.moveTo(halfWidth, 0);
        this.ctx.lineTo(halfWidth, this.height);
        this.ctx.stroke();
        
        // Стрелки на осях
        this.drawArrow(halfWidth, 10, halfWidth, 0);
        this.drawArrow(this.width - 10, halfHeight, this.width, halfHeight);
        
        // Подписи осей
        this.ctx.fillText('Y', halfWidth - 20, 15);
        this.ctx.fillText('X', this.width - 15, halfHeight + 20);
        
        // Подписи делений
        this.drawAxisLabels();
    }
    
    /**
     * Рисует стрелку
     */
    drawArrow(fromX, fromY, toX, toY) {
        const headlen = 10 / this.scale;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - headlen * Math.cos(angle - Math.PI / 6),
            toY - headlen * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            toX - headlen * Math.cos(angle + Math.PI / 6),
            toY - headlen * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = this.colors.axes;
        this.ctx.fill();
    }
    
    /**
     * Отрисовывает подписи на осях
     */
    drawAxisLabels() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const scaledGridSize = this.gridSize * this.scale;
        
        this.ctx.font = `${10 / this.scale}px Arial`;
        this.ctx.fillStyle = this.colors.text;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        // Подписи на оси X
        for (let x = halfWidth + scaledGridSize; x < this.width; x += scaledGridSize) {
            const value = Math.round((x - halfWidth) / scaledGridSize);
            if (value % 5 === 0) {
                this.ctx.fillText(value.toString(), x, halfHeight + 5);
            }
        }
        
        for (let x = halfWidth - scaledGridSize; x > 0; x -= scaledGridSize) {
            const value = Math.round((x - halfWidth) / scaledGridSize);
            if (value % 5 === 0) {
                this.ctx.fillText(value.toString(), x, halfHeight + 5);
            }
        }
        
        // Подписи на оси Y
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        for (let y = halfHeight + scaledGridSize; y < this.height; y += scaledGridSize) {
            const value = Math.round((halfHeight - y) / scaledGridSize);
            if (value % 5 === 0 && value !== 0) {
                this.ctx.fillText(value.toString(), halfWidth - 5, y);
            }
        }
        
        for (let y = halfHeight - scaledGridSize; y > 0; y -= scaledGridSize) {
            const value = Math.round((halfHeight - y) / scaledGridSize);
            if (value % 5 === 0 && value !== 0) {
                this.ctx.fillText(value.toString(), halfWidth - 5, y);
            }
        }
        
        // Центр координат
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('0', halfWidth - 5, halfHeight + 5);
    }
    
    /**
     * Отрисовывает пиксель (квадрат в сетке)
     */
    drawPixel(gridX, gridY, color = '#000000', size = null) {
        const pixelSize = size || this.gridSize;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const x = halfWidth + gridX * this.gridSize * this.scale;
        const y = halfHeight - gridY * this.gridSize * this.scale;
        const scaledSize = pixelSize * this.scale;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x - scaledSize / 2,
            y - scaledSize / 2,
            scaledSize,
            scaledSize
        );
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 0.5 / this.scale;
        this.ctx.strokeRect(
            x - scaledSize / 2,
            y - scaledSize / 2,
            scaledSize,
            scaledSize
        );
    }
    
    /**
     * Отрисовывает все точки алгоритма
     */
    drawPoints() {
        if (!this.currentAlgorithm) return;
        
        const color = this.colors[this.currentAlgorithm] || '#000000';
        
        // Отрисовываем все точки
        this.points.forEach((point, index) => {
            if (this.isStepMode && index > this.currentStep) {
                return; // В пошаговом режиме рисуем только до текущего шага
            }
            
            const isActive = this.isStepMode && index === this.currentStep;
            
            this.drawPixel(
                point.x,
                point.y,
                isActive ? this.colors.activePixel : color,
                isActive ? 6 : 4
            );
            
            // Если это активная точка, показываем дополнительную информацию
            if (isActive && point.calculation) {
                this.drawPointInfo(point);
            }
        });
    }
    
    /**
     * Отрисовывает информацию о точке
     */
    drawPointInfo(point) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const x = halfWidth + point.x * this.gridSize * this.scale;
        const y = halfHeight - point.y * this.gridSize * this.scale;
        
        // Фон для текста
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1 / this.scale;
        
        const text = `(${point.x}, ${point.y})`;
        const metrics = this.ctx.measureText(text);
        const padding = 8 / this.scale;
        
        this.ctx.beginPath();
        this.ctx.roundRect(
            x + 10,
            y - 20,
            metrics.width + padding * 2,
            20,
            4 / this.scale
        );
        this.ctx.fill();
        this.ctx.stroke();
        
        // Текст
        this.ctx.fillStyle = '#333';
        this.ctx.font = `${12 / this.scale}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + 10 + padding, y - 10);
    }
    
    /**
     * Отрисовывает линию между точками
     */
    drawLine(x1, y1, x2, y2, color = '#000000') {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const startX = halfWidth + x1 * this.gridSize * this.scale;
        const startY = halfHeight - y1 * this.gridSize * this.scale;
        const endX = halfWidth + x2 * this.gridSize * this.scale;
        const endY = halfHeight - y2 * this.gridSize * this.scale;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2 / this.scale;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }
    
    /**
     * Отрисовывает окружность
     */
    drawCircle(cx, cy, radius, color = '#000000') {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const centerX = halfWidth + cx * this.gridSize * this.scale;
        const centerY = halfHeight - cy * this.gridSize * this.scale;
        const scaledRadius = radius * this.gridSize * this.scale;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2 / this.scale;
        this.ctx.setLineDash([5 / this.scale, 5 / this.scale]);
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, scaledRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    /**
     * Устанавливает точки для отрисовки
     */
    setPoints(points, algorithm) {
        this.points = points;
        this.currentAlgorithm = algorithm;
        this.currentStep = this.isStepMode ? 0 : points.length - 1;
        this.drawCoordinateSystem();
    }
    
    /**
     * Устанавливает масштаб
     */
    setScale(scale) {
        this.scale = Math.max(0.5, Math.min(3, scale));
        this.drawCoordinateSystem();
    }
    
    /**
     * Включает/выключает сетку
     */
    setGridEnabled(enabled) {
        this.gridEnabled = enabled;
        this.drawCoordinateSystem();
    }
    
    /**
     * Включает/выключает оси
     */
    setAxesEnabled(enabled) {
        this.axesEnabled = enabled;
        this.drawCoordinateSystem();
    }
    
    /**
     * Переключает пошаговый режим
     */
    setStepMode(enabled) {
        this.isStepMode = enabled;
        this.currentStep = enabled ? 0 : this.points.length - 1;
        this.drawCoordinateSystem();
    }
    
    /**
     * Переходит к следующему шагу
     */
    nextStep() {
        if (this.currentStep < this.points.length - 1) {
            this.currentStep++;
            this.drawCoordinateSystem();
            return true;
        }
        return false;
    }
    
    /**
     * Переходит к предыдущему шагу
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.drawCoordinateSystem();
            return true;
        }
        return false;
    }
    
    /**
     * Сбрасывает шаги
     */
    resetSteps() {
        this.currentStep = this.isStepMode ? 0 : this.points.length - 1;
        this.drawCoordinateSystem();
    }
    
    /**
     * Обрабатывает движение мыши
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const gridCoords = this.screenToGrid(x, y);
        
        // Обновляем отображение координат
        const overlay = document.getElementById('coordinatesOverlay');
        if (overlay) {
            overlay.textContent = `Координаты: (${gridCoords.x}, ${gridCoords.y})`;
        }
    }
    
    /**
     * Обрабатывает клик по canvas
     */
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const gridCoords = this.screenToGrid(x, y);
        
        // Можно добавить логику для добавления точек по клику
        console.log('Клик в точке:', gridCoords);
    }
    
    /**
     * Преобразует экранные координаты в координаты сетки
     */
    screenToGrid(screenX, screenY) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const gridX = Math.round((screenX - halfWidth) / (this.gridSize * this.scale));
        const gridY = Math.round((halfHeight - screenY) / (this.gridSize * this.scale));
        
        return { x: gridX, y: gridY };
    }
    
    /**
     * Преобразует координаты сетки в экранные координаты
     */
    gridToScreen(gridX, gridY) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const screenX = halfWidth + gridX * this.gridSize * this.scale;
        const screenY = halfHeight - gridY * this.gridSize * this.scale;
        
        return { x: screenX, y: screenY };
    }
}