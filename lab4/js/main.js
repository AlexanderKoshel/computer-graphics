// js/main.js
/**
 * Основной файл приложения - точка входа
 */

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляры классов
    const algorithms = new RasterAlgorithms();
    const canvasManager = new CanvasManager('mainCanvas');
    const uiControls = new UIControls(canvasManager, algorithms);
    const performanceMeasurer = new PerformanceMeasurer();
    const stepVisualizer = new StepByStepVisualizer(canvasManager, uiControls);
    
    // Экспортируем глобально для отладки
    window.app = {
        algorithms,
        canvasManager,
        uiControls,
        performanceMeasurer,
        stepVisualizer
    };
    
    console.log('Приложение инициализировано. Для отладки используйте window.app');
    
    // Добавляем дополнительные обработчики событий
    initAdditionalEvents(uiControls, stepVisualizer);
    
    // Загружаем тестовый пример по умолчанию
    setTimeout(() => {
        uiControls.handleTestExample();
        uiControls.handleDraw();
    }, 100);
});

/**
 * Инициализация дополнительных событий
 */
function initAdditionalEvents(uiControls, stepVisualizer) {
    // Обработка клавиатуры для пошагового режима
    document.addEventListener('keydown', (e) => {
        // Стрелки влево/вправо для навигации по шагам
        if (e.key === 'ArrowLeft') {
            uiControls.handlePrevStep();
        } else if (e.key === 'ArrowRight') {
            uiControls.handleNextStep();
        }
        
        // Пробел для переключения воспроизведения/паузы
        if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            stepVisualizer.togglePlayPause();
        }
        
        // Enter для рисования
        if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            uiControls.handleDraw();
        }
    });
    
    // Добавляем кнопку воспроизведения анимации
    const stepControls = document.getElementById('stepControls');
    if (stepControls) {
        const playBtn = document.createElement('button');
        playBtn.id = 'playAnimation';
        playBtn.className = 'btn primary small';
        playBtn.innerHTML = '<span class="btn-icon">▶️</span> Воспроизвести';
        playBtn.addEventListener('click', () => stepVisualizer.togglePlayPause());
        
        const stepButtons = stepControls.querySelector('.step-buttons');
        if (stepButtons) {
            stepButtons.insertBefore(playBtn, stepButtons.firstChild);
        }
        
        // Добавляем селектор скорости
        const speedSelector = document.createElement('select');
        speedSelector.id = 'animationSpeed';
        speedSelector.className = 'speed-selector';
        speedSelector.innerHTML = `
            <option value="1000">Медленно (1x)</option>
            <option value="500" selected>Средне (2x)</option>
            <option value="250">Быстро (4x)</option>
            <option value="100">Очень быстро (10x)</option>
        `;
        speedSelector.addEventListener('change', (e) => {
            stepVisualizer.setSpeed(parseInt(e.target.value));
        });
        
        const stepInfo = stepControls.querySelector('.step-info');
        if (stepInfo) {
            const speedContainer = document.createElement('div');
            speedContainer.className = 'speed-container';
            speedContainer.innerHTML = '<span>Скорость:</span>';
            speedContainer.appendChild(speedSelector);
            stepInfo.appendChild(speedContainer);
        }
    }
    
    // Добавляем возможность перетаскивания для масштабирования
    const canvas = document.getElementById('mainCanvas');
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // Рассчитываем изменение позиции
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        // Масштабируем на основе движения колесика мыши
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            const scaleDelta = -deltaY * 0.01;
            const currentScale = parseFloat(uiControls.scaleSlider.value);
            const newScale = Math.max(0.5, Math.min(3, currentScale + scaleDelta));
            
            uiControls.scaleSlider.value = newScale;
            uiControls.scaleValue.textContent = newScale.toFixed(1);
            uiControls.currentScale.textContent = newScale.toFixed(1);
            uiControls.canvasManager.setScale(newScale);
        }
        
        lastX = e.clientX;
        lastY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'crosshair';
    });
    
    // Масштабирование колесиком мыши
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const scaleDelta = e.deltaY > 0 ? -0.1 : 0.1;
        const currentScale = parseFloat(uiControls.scaleSlider.value);
        const newScale = Math.max(0.5, Math.min(3, currentScale + scaleDelta));
        
        uiControls.scaleSlider.value = newScale;
        uiControls.scaleValue.textContent = newScale.toFixed(1);
        uiControls.currentScale.textContent = newScale.toFixed(1);
        uiControls.canvasManager.setScale(newScale);
    });
    
    // Добавляем стили для новых элементов
    const style = document.createElement('style');
    style.textContent = `
        .speed-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
            font-size: 12px;
            color: #666;
        }
        
        .speed-selector {
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            font-size: 12px;
        }
        
        .point-highlight {
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        .formula-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 12px;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
        
        .step-details-content {
            margin-top: 10px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 13px;
        }
        
        .detail-label {
            color: #666;
            font-weight: 500;
        }
        
        .detail-value {
            color: #333;
            font-family: 'Courier New', monospace;
        }
        
        .canvas-wrapper {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RasterAlgorithms,
        CanvasManager,
        UIControls,
        PerformanceMeasurer,
        StepByStepVisualizer
    };
}