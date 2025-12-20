// js/ui-controls.js
/**
 * Класс для управления элементами интерфейса
 */
class UIControls {
    constructor(canvasManager, algorithms) {
        this.canvasManager = canvasManager;
        this.algorithms = algorithms;
        this.currentAlgorithm = 'stepByStep';
        this.isDrawing = false;
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.updateUI();
    }
    
    /**
     * Привязывает DOM элементы
     */
    bindElements() {
        // Элементы выбора алгоритма
        this.algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
        
        // Поля ввода
        this.x1Input = document.getElementById('x1');
        this.y1Input = document.getElementById('y1');
        this.x2Input = document.getElementById('x2');
        this.y2Input = document.getElementById('y2');
        this.cxInput = document.getElementById('cx');
        this.cyInput = document.getElementById('cy');
        this.radiusInput = document.getElementById('radius');
        
        // Контейнеры параметров
        this.lineParams = document.querySelector('.line-params');
        this.circleParams = document.querySelector('.circle-params');
        
        // Кнопки
        this.drawBtn = document.getElementById('drawBtn');
        this.stepBtn = document.getElementById('stepBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.testBtn = document.getElementById('testBtn');
        this.compareBtn = document.getElementById('compareBtn');
        
        // Управление шагами
        this.prevStepBtn = document.getElementById('prevStep');
        this.nextStepBtn = document.getElementById('nextStep');
        this.resetStepBtn = document.getElementById('resetStep');
        this.stepControls = document.getElementById('stepControls');
        
        // Настройки отображения
        this.scaleSlider = document.getElementById('scaleSlider');
        this.scaleValue = document.getElementById('scaleValue');
        this.currentScale = document.getElementById('currentScale');
        
        this.showGrid = document.getElementById('showGrid');
        this.showAxes = document.getElementById('showAxes');
        this.showCalculations = document.getElementById('showCalculations');
        this.showStepByStep = document.getElementById('showStepByStep');
        
        // Информационные элементы
        this.executionTime = document.getElementById('executionTime');
        this.pointsCount = document.getElementById('pointsCount');
        this.currentAlgorithmText = document.getElementById('currentAlgorithm');
        this.currentStep = document.getElementById('currentStep');
        this.totalSteps = document.getElementById('totalSteps');
        this.stepDescription = document.getElementById('stepDescription');
        
        // Описание алгоритма
        this.algorithmName = document.getElementById('algorithmName');
        this.algorithmDescription = document.getElementById('algorithmDescription');
        this.algorithmFormula = document.getElementById('algorithmFormula');
        this.algorithmComplexity = document.getElementById('algorithmComplexity');
        this.algorithmAdvantages = document.getElementById('algorithmAdvantages');
        this.algorithmDisadvantages = document.getElementById('algorithmDisadvantages');
        
        // Вычисления
        this.calculationsList = document.getElementById('calculationsList');
        this.toggleCalculations = document.getElementById('toggleCalculations');
        this.copyCalculations = document.getElementById('copyCalculations');
        
        // Сравнение
        this.comparisonTable = document.getElementById('comparisonTable');
    }
    
    /**
     * Привязывает обработчики событий
     */
    bindEvents() {
        // Выбор алгоритма
        this.algorithmRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentAlgorithm = e.target.value;
                this.updateUI();
            });
        });
        
        // Кнопки управления
        this.drawBtn.addEventListener('click', () => this.handleDraw());
        this.stepBtn.addEventListener('click', () => this.handleStepByStep());
        this.clearBtn.addEventListener('click', () => this.handleClear());
        this.testBtn.addEventListener('click', () => this.handleTestExample());
        this.compareBtn.addEventListener('click', () => this.handleCompare());
        
        // Управление шагами
        this.prevStepBtn.addEventListener('click', () => this.handlePrevStep());
        this.nextStepBtn.addEventListener('click', () => this.handleNextStep());
        this.resetStepBtn.addEventListener('click', () => this.handleResetSteps());
        
        // Настройки отображения
        this.scaleSlider.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            this.scaleValue.textContent = scale.toFixed(1);
            this.currentScale.textContent = scale.toFixed(1);
            this.canvasManager.setScale(scale);
        });
        
        this.showGrid.addEventListener('change', (e) => {
            this.canvasManager.setGridEnabled(e.target.checked);
        });
        
        this.showAxes.addEventListener('change', (e) => {
            this.canvasManager.setAxesEnabled(e.target.checked);
        });
        
        this.showStepByStep.addEventListener('change', (e) => {
            this.canvasManager.setStepMode(e.target.checked);
            this.stepControls.style.display = e.target.checked ? 'flex' : 'none';
            if (!e.target.checked) {
                this.updateStepInfo();
            }
        });
        
        // Вычисления
        this.toggleCalculations.addEventListener('click', () => this.toggleCalculationsView());
        this.copyCalculations.addEventListener('click', () => this.copyCalculationsToClipboard());
        
        // Валидация ввода
        this.x1Input.addEventListener('change', () => this.validateInputs());
        this.y1Input.addEventListener('change', () => this.validateInputs());
        this.x2Input.addEventListener('change', () => this.validateInputs());
        this.y2Input.addEventListener('change', () => this.validateInputs());
        this.cxInput.addEventListener('change', () => this.validateInputs());
        this.cyInput.addEventListener('change', () => this.validateInputs());
        this.radiusInput.addEventListener('change', () => this.validateInputs());
    }
    
    /**
     * Обновляет интерфейс в соответствии с выбранным алгоритмом
     */
    updateUI() {
        // Показываем/скрываем параметры для линии/окружности
        const isCircle = this.currentAlgorithm === 'bresenhamCircle';
        this.lineParams.style.display = isCircle ? 'none' : 'flex';
        this.circleParams.style.display = isCircle ? 'flex' : 'none';
        
        // Обновляем информацию об алгоритме
        const info = this.algorithms.getAlgorithmInfo(this.currentAlgorithm);
        this.algorithmName.textContent = info.name;
        this.algorithmDescription.textContent = info.description;
        this.algorithmFormula.textContent = info.formula;
        this.algorithmComplexity.textContent = info.complexity;
        this.algorithmAdvantages.textContent = info.advantages;
        this.algorithmDisadvantages.textContent = info.disadvantages;
        
        // Обновляем текст текущего алгоритма
        this.currentAlgorithmText.textContent = info.name;
        
        // Сбрасываем информацию о шагах
        this.updateStepInfo();
    }
    
    /**
     * Обрабатывает рисование
     */
    handleDraw() {
        if (this.isDrawing) return;
        
        this.isDrawing = true;
        this.drawBtn.disabled = true;
        
        try {
            const params = this.getInputParams();
            const startTime = performance.now();
            
            let result;
            switch (this.currentAlgorithm) {
                case 'stepByStep':
                    result = this.algorithms.stepByStepLine(params.x1, params.y1, params.x2, params.y2);
                    break;
                case 'dda':
                    result = this.algorithms.ddaLine(params.x1, params.y1, params.x2, params.y2);
                    break;
                case 'bresenhamLine':
                    result = this.algorithms.bresenhamLine(params.x1, params.y1, params.x2, params.y2);
                    break;
                case 'bresenhamCircle':
                    result = this.algorithms.bresenhamCircle(params.cx, params.cy, params.radius);
                    break;
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Устанавливаем точки на canvas
            this.canvasManager.setPoints(result.points, this.currentAlgorithm);
            
            // Обновляем информацию о производительности
            this.executionTime.textContent = `${executionTime.toFixed(2)} мс`;
            this.pointsCount.textContent = result.points.length;
            
            // Обновляем вычисления
            this.updateCalculations(result.calculations);
            
            // Обновляем информацию о шагах
            this.updateStepInfo();
            
            // Если включен пошаговый режим, показываем панель управления
            if (this.showStepByStep.checked) {
                this.stepControls.style.display = 'flex';
            }
            
        } catch (error) {
            console.error('Ошибка при рисовании:', error);
            alert(`Ошибка: ${error.message}`);
        } finally {
            this.isDrawing = false;
            this.drawBtn.disabled = false;
        }
    }
    
    /**
     * Обрабатывает пошаговое рисование
     */
    handleStepByStep() {
        // Включаем пошаговый режим
        this.showStepByStep.checked = true;
        this.canvasManager.setStepMode(true);
        this.stepControls.style.display = 'flex';
        
        // Запускаем рисование
        this.handleDraw();
    }
    
    /**
     * Обрабатывает очистку
     */
    handleClear() {
        this.canvasManager.clear();
        this.canvasManager.drawCoordinateSystem();
        
        // Сбрасываем информацию
        this.executionTime.textContent = '0 мс';
        this.pointsCount.textContent = '0';
        this.calculationsList.innerHTML = `
            <div class="calculation-item">
                <span class="calc-step">0.</span>
                <span class="calc-text">Выберите алгоритм и нажмите "Нарисовать"</span>
            </div>
        `;
        
        // Скрываем панель управления шагами
        this.stepControls.style.display = 'none';
        this.showStepByStep.checked = false;
        this.canvasManager.setStepMode(false);
        
        // Сбрасываем информацию о шагах
        this.updateStepInfo();
    }
    
    /**
     * Обрабатывает тестовый пример
     */
    handleTestExample() {
        const example = this.algorithms.getTestExample(this.currentAlgorithm);
        
        if (this.currentAlgorithm === 'bresenhamCircle') {
            this.cxInput.value = example.cx;
            this.cyInput.value = example.cy;
            this.radiusInput.value = example.radius;
        } else {
            this.x1Input.value = example.x1;
            this.y1Input.value = example.y1;
            this.x2Input.value = example.x2;
            this.y2Input.value = example.y2;
        }
        
        this.validateInputs();
    }
    
    /**
     * Обрабатывает сравнение алгоритмов
     */
    handleCompare() {
        const params = this.getInputParams();
        
        // Если это окружность, используем только для алгоритма окружности
        if (this.currentAlgorithm === 'bresenhamCircle') {
            this.compareCircleAlgorithms(params);
        } else {
            this.compareLineAlgorithms(params);
        }
    }
    
    /**
     * Сравнивает алгоритмы для отрезков
     */
    compareLineAlgorithms(params) {
        const algorithms = [
            { name: 'stepByStep', label: 'Пошаговый' },
            { name: 'dda', label: 'ЦДА' },
            { name: 'bresenhamLine', label: 'Брезенхема (линия)' }
        ];
        
        const results = [];
        
        algorithms.forEach(algo => {
            const startTime = performance.now();
            
            let result;
            switch (algo.name) {
                case 'stepByStep':
                    result = this.algorithms.stepByStepLine(params.x1, params.y1, params.x2, params.y2);
                    break;
                case 'dda':
                    result = this.algorithms.ddaLine(params.x1, params.y1, params.x2, params.y2);
                    break;
                case 'bresenhamLine':
                    result = this.algorithms.bresenhamLine(params.x1, params.y1, params.x2, params.y2);
                    break;
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            results.push({
                name: algo.label,
                time: executionTime,
                points: result.points.length,
                efficiency: (result.points.length / executionTime).toFixed(2)
            });
        });
        
        this.updateComparisonTable(results);
    }
    
    /**
     * Сравнивает алгоритмы для окружностей
     */
    compareCircleAlgorithms(params) {
        const results = [{
            name: 'Брезенхема (окружность)',
            time: 0,
            points: 0,
            efficiency: 0
        }];
        
        // Только один алгоритм для окружностей
        const startTime = performance.now();
        const result = this.algorithms.bresenhamCircle(params.cx, params.cy, params.radius);
        const endTime = performance.now();
        
        results[0].time = endTime - startTime;
        results[0].points = result.points.length;
        results[0].efficiency = (result.points.length / results[0].time).toFixed(2);
        
        this.updateComparisonTable(results);
    }
    
    /**
     * Обновляет таблицу сравнения
     */
    updateComparisonTable(results) {
        const tbody = this.comparisonTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.name}</td>
                <td>${result.time.toFixed(2)}</td>
                <td>${result.points}</td>
                <td>${result.efficiency} точек/мс</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    /**
     * Обрабатывает переход к предыдущему шагу
     */
    handlePrevStep() {
        if (this.canvasManager.prevStep()) {
            this.updateStepInfo();
        }
    }
    
    /**
     * Обрабатывает переход к следующему шагу
     */
    handleNextStep() {
        if (this.canvasManager.nextStep()) {
            this.updateStepInfo();
        }
    }
    
    /**
     * Сбрасывает шаги
     */
    handleResetSteps() {
        this.canvasManager.resetSteps();
        this.updateStepInfo();
    }
    
    /**
     * Обновляет информацию о шагах
     */
    updateStepInfo() {
        const points = this.canvasManager.points;
        const currentStep = this.canvasManager.currentStep;
        
        this.currentStep.textContent = currentStep;
        this.totalSteps.textContent = points.length - 1;
        
        if (points.length > 0 && currentStep < points.length) {
            const point = points[currentStep];
            
            let description = `Точка (${point.x}, ${point.y})`;
            if (point.calculation) {
                description += `: ${point.calculation}`;
            }
            if (point.decision) {
                description += ` [${point.decision}]`;
            }
            
            this.stepDescription.textContent = description;
        } else {
            this.stepDescription.textContent = 'Нет данных';
        }
    }
    
    /**
     * Обновляет вычисления
     */
    updateCalculations(calculations) {
        this.calculationsList.innerHTML = '';
        
        if (!this.showCalculations.checked || !calculations || calculations.length === 0) {
            this.calculationsList.innerHTML = `
                <div class="calculation-item">
                    <span class="calc-step">0.</span>
                    <span class="calc-text">Включите "Показать вычисления" для отображения</span>
                </div>
            `;
            return;
        }
        
        calculations.forEach((calc, index) => {
            const item = document.createElement('div');
            item.className = 'calculation-item';
            item.innerHTML = `
                <span class="calc-step">${index + 1}.</span>
                <span class="calc-text">${calc}</span>
            `;
            this.calculationsList.appendChild(item);
        });
        
        // Прокручиваем вниз
        this.calculationsList.scrollTop = this.calculationsList.scrollHeight;
    }
    
    /**
     * Переключает отображение вычислений
     */
    toggleCalculationsView() {
        const isExpanded = this.calculationsList.style.maxHeight === 'none';
        
        if (isExpanded) {
            this.calculationsList.style.maxHeight = '200px';
            this.toggleCalculations.innerHTML = '<span class="btn-icon">📋</span> Развернуть все';
        } else {
            this.calculationsList.style.maxHeight = 'none';
            this.toggleCalculations.innerHTML = '<span class="btn-icon">📋</span> Свернуть';
        }
    }
    
    /**
     * Копирует вычисления в буфер обмена
     */
    async copyCalculationsToClipboard() {
        const calculations = Array.from(this.calculationsList.querySelectorAll('.calc-text'))
            .map(el => el.textContent)
            .join('\n');
        
        try {
            await navigator.clipboard.writeText(calculations);
            alert('Вычисления скопированы в буфер обмена');
        } catch (error) {
            console.error('Ошибка копирования:', error);
            alert('Не удалось скопировать вычисления');
        }
    }
    
    /**
     * Получает параметры из полей ввода
     */
    getInputParams() {
        if (this.currentAlgorithm === 'bresenhamCircle') {
            return {
                cx: parseInt(this.cxInput.value) || 0,
                cy: parseInt(this.cyInput.value) || 0,
                radius: parseInt(this.radiusInput.value) || 1
            };
        } else {
            return {
                x1: parseInt(this.x1Input.value) || 0,
                y1: parseInt(this.y1Input.value) || 0,
                x2: parseInt(this.x2Input.value) || 0,
                y2: parseInt(this.y2Input.value) || 0
            };
        }
    }
    
    /**
     * Валидирует ввод
     */
    validateInputs() {
        const params = this.getInputParams();
        
        // Проверка на отрицательные значения (если нужно)
        if (params.radius && params.radius < 1) {
            this.radiusInput.value = 1;
        }
        
        // Проверка на слишком большие значения
        const maxValue = 100;
        Object.keys(params).forEach(key => {
            if (Math.abs(params[key]) > maxValue) {
                const input = document.getElementById(key);
                if (input) {
                    input.value = Math.sign(params[key]) * maxValue;
                }
            }
        });
    }
}