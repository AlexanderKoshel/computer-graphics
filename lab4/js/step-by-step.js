// js/step-by-step.js
/**
 * Класс для пошаговой визуализации алгоритмов
 */
class StepByStepVisualizer {
    constructor(canvasManager, uiControls) {
        this.canvasManager = canvasManager;
        this.uiControls = uiControls;
        this.isPlaying = false;
        this.playbackSpeed = 500; // мс между шагами
        this.playbackInterval = null;
        this.currentStepData = null;
    }
    
    /**
     * Начинает пошаговую анимацию
     */
    startAnimation() {
        if (this.isPlaying || !this.canvasManager.isStepMode) return;
        
        this.isPlaying = true;
        this.updatePlayButton();
        
        this.playbackInterval = setInterval(() => {
            const hasNext = this.canvasManager.nextStep();
            this.uiControls.updateStepInfo();
            
            if (!hasNext) {
                this.stopAnimation();
            }
        }, this.playbackSpeed);
    }
    
    /**
     * Останавливает анимацию
     */
    stopAnimation() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
        this.updatePlayButton();
    }
    
    /**
     * Переключает воспроизведение/паузу
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }
    
    /**
     * Обновляет кнопку воспроизведения
     */
    updatePlayButton() {
        const playBtn = document.getElementById('playAnimation');
        if (playBtn) {
            if (this.isPlaying) {
                playBtn.innerHTML = '<span class="btn-icon">⏸️</span> Пауза';
                playBtn.classList.remove('primary');
                playBtn.classList.add('warning');
            } else {
                playBtn.innerHTML = '<span class="btn-icon">▶️</span> Воспроизвести';
                playBtn.classList.remove('warning');
                playBtn.classList.add('primary');
            }
        }
    }
    
    /**
     * Устанавливает скорость анимации
     */
    setSpeed(speed) {
        this.playbackSpeed = speed;
        
        if (this.isPlaying) {
            this.stopAnimation();
            this.startAnimation();
        }
    }
    
    /**
     * Показывает подробности текущего шага
     */
    showStepDetails(stepData) {
        this.currentStepData = stepData;
        this.updateStepDetailsUI();
    }
    
    /**
     * Обновляет UI с деталями шага
     */
    updateStepDetailsUI() {
        const container = document.getElementById('stepDetails');
        if (!container || !this.currentStepData) return;
        
        const point = this.currentStepData;
        
        let html = `
            <h4>Шаг ${point.step}</h4>
            <div class="step-details-content">
                <div class="detail-row">
                    <span class="detail-label">Координаты:</span>
                    <span class="detail-value">(${point.x}, ${point.y})</span>
                </div>
        `;
        
        if (point.calculation) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">Вычисления:</span>
                    <span class="detail-value">${point.calculation}</span>
                </div>
            `;
        }
        
        if (point.decision) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">Решение:</span>
                    <span class="detail-value">${point.decision}</span>
                </div>
            `;
        }
        
        if (point.err !== undefined) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">Ошибка (err):</span>
                    <span class="detail-value">${point.err}</span>
                </div>
            `;
        }
        
        if (point.err2 !== undefined) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">2*err:</span>
                    <span class="detail-value">${point.err2}</span>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    /**
     * Подсвечивает текущую точку
     */
    highlightCurrentPoint() {
        const points = this.canvasManager.points;
        const currentStep = this.canvasManager.currentStep;
        
        if (points.length > 0 && currentStep < points.length) {
            const point = points[currentStep];
            
            // Создаем эффект пульсации
            const highlight = document.createElement('div');
            highlight.className = 'point-highlight';
            highlight.style.position = 'absolute';
            
            const screenCoords = this.canvasManager.gridToScreen(point.x, point.y);
            highlight.style.left = `${screenCoords.x - 10}px`;
            highlight.style.top = `${screenCoords.y - 10}px`;
            highlight.style.width = '20px';
            highlight.style.height = '20px';
            highlight.style.borderRadius = '50%';
            highlight.style.border = '2px solid #ff0000';
            highlight.style.boxShadow = '0 0 10px #ff0000';
            highlight.style.animation = 'pulse 1s infinite';
            highlight.style.pointerEvents = 'none';
            highlight.style.zIndex = '1000';
            
            // Добавляем на canvas
            const canvasContainer = document.querySelector('.canvas-wrapper');
            if (canvasContainer) {
                canvasContainer.appendChild(highlight);
                
                // Удаляем через 1 секунду
                setTimeout(() => {
                    if (highlight.parentNode) {
                        highlight.parentNode.removeChild(highlight);
                    }
                }, 1000);
            }
        }
    }
    
    /**
     * Показывает линию между предыдущей и текущей точками
     */
    showStepLine() {
        const points = this.canvasManager.points;
        const currentStep = this.canvasManager.currentStep;
        
        if (currentStep > 0 && currentStep < points.length) {
            const prevPoint = points[currentStep - 1];
            const currentPoint = points[currentStep];
            
            // Рисуем временную линию
            this.canvasManager.drawLine(
                prevPoint.x,
                prevPoint.y,
                currentPoint.x,
                currentPoint.y,
                'rgba(255, 107, 107, 0.5)'
            );
            
            // Убираем линию через некоторое время
            setTimeout(() => {
                this.canvasManager.drawCoordinateSystem();
            }, 500);
        }
    }
    
    /**
     * Показывает визуальное объяснение алгоритма
     */
    showAlgorithmExplanation(algorithm) {
        const explanations = {
            stepByStep: {
                title: "Пошаговый алгоритм",
                steps: [
                    "1. Вычисляем разницу между конечной и начальной точками",
                    "2. Определяем количество шагов (максимум из |Δx| и |Δy|)",
                    "3. Вычисляем приращения для каждого шага",
                    "4. Для каждого шага вычисляем координаты и округляем до ближайшего целого"
                ]
            },
            dda: {
                title: "Алгоритм ЦДА",
                steps: [
                    "1. Аналогичен пошаговому алгоритму",
                    "2. Использует более точное вычисление приращений",
                    "3. Избегает накопления ошибок округления",
                    "4. Все еще использует операции с плавающей точкой"
                ]
            },
            bresenhamLine: {
                title: "Алгоритм Брезенхема (отрезки)",
                steps: [
                    "1. Использует только целочисленные операции",
                    "2. Основан на параметре ошибки (err)",
                    "3. На каждом шаге проверяет знак 2*err",
                    "4. В зависимости от результата увеличивает или не увеличивает координату y"
                ]
            },
            bresenhamCircle: {
                title: "Алгоритм Брезенхема (окружности)",
                steps: [
                    "1. Использует симметрию окружности (8 точек)",
                    "2. Начинает от точки (0, R)",
                    "3. Использует параметр решения d",
                    "4. На каждом шаге выбирает следующую точку по критерию d",
                    "5. Добавляет все 8 симметричных точек"
                ]
            }
        };
        
        const explanation = explanations[algorithm];
        if (!explanation) return;
        
        const container = document.getElementById('algorithmExplanation');
        if (container) {
            let html = `<h4>${explanation.title}</h4><ul>`;
            explanation.steps.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        }
    }
    
    /**
     * Создает визуализацию формулы
     */
    createFormulaVisualization(algorithm, stepData) {
        const container = document.getElementById('formulaVisualization');
        if (!container) return;
        
        let html = '<h4>Формула текущего шага</h4><div class="formula-box">';
        
        switch (algorithm) {
            case 'bresenhamLine':
                if (stepData) {
                    html += `
                        <p>Параметр ошибки: err = ${stepData.err}</p>
                        <p>2 * err = ${stepData.err2}</p>
                        <p>Решение: ${stepData.decision}</p>
                    `;
                }
                break;
                
            case 'bresenhamCircle':
                if (stepData) {
                    html += `
                        <p>Параметр решения: d = ${stepData.d || '?'}</p>
                        <p>Текущие координаты: x = ${stepData.x || '?'}, y = ${stepData.y || '?'}</p>
                    `;
                }
                break;
                
            default:
                if (stepData && stepData.calculation) {
                    html += `<p>${stepData.calculation}</p>`;
                }
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
}