// algorithms.js
// Реализация базовых растровых алгоритмов

/**
 * Класс для реализации растровых алгоритмов
 */
class RasterAlgorithms {
    constructor() {
        // Цвета для разных алгоритмов
        this.colors = {
            stepByStep: '#FF6B6B',    // Красный
            dda: '#4ECDC4',           // Бирюзовый
            bresenhamLine: '#45B7D1', // Синий
            bresenhamCircle: '#96CEB4', // Зеленый
            grid: '#E0E0E0',          // Светло-серый (сетка)
            axes: '#000000',          // Черный (оси)
            text: '#333333'           // Темно-серый (текст)
        };
    }

    // ==================== ПОШАГОВЫЙ АЛГОРИТМ ====================
    
    /**
     * Пошаговый алгоритм (Step-by-Step / Простой DDA)
     * @param {number} x1 - Начальная x координата
     * @param {number} y1 - Начальная y координата
     * @param {number} x2 - Конечная x координата
     * @param {number} y2 - Конечная y координата
     * @returns {Object} Объект с точками и вычислениями
     */
    stepByStepLine(x1, y1, x2, y2) {
        const points = [];
        const calculations = [];
        
        // 1. Вычисляем разницы
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        calculations.push(`1. Вычисляем разницы: dx = ${x2} - ${x1} = ${dx}, dy = ${y2} - ${y1} = ${dy}`);
        
        // 2. Определяем количество шагов
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        calculations.push(`2. Количество шагов = max(|${dx}|, |${dy}|) = ${steps}`);
        
        // 3. Вычисляем приращения
        const xIncrement = dx / steps;
        const yIncrement = dy / steps;
        calculations.push(`3. Приращения: Xinc = ${dx}/${steps} = ${xIncrement.toFixed(3)}, Yinc = ${dy}/${steps} = ${yIncrement.toFixed(3)}`);
        
        // 4. Начальные значения
        let x = x1;
        let y = y1;
        
        calculations.push(`4. Начальная точка: (${Math.round(x)}, ${Math.round(y)})`);
        points.push({ x: Math.round(x), y: Math.round(y), step: 0 });
        
        // 5. Основной цикл
        for (let i = 1; i <= steps; i++) {
            x += xIncrement;
            y += yIncrement;
            
            const roundedX = Math.round(x);
            const roundedY = Math.round(y);
            
            calculations.push(`${i+4}. Шаг ${i}: x = ${x.toFixed(3)}, y = ${y.toFixed(3)} → (${roundedX}, ${roundedY})`);
            points.push({ 
                x: roundedX, 
                y: roundedY, 
                step: i,
                calculation: `x = ${x.toFixed(3)}, y = ${y.toFixed(3)}`
            });
        }
        
        return {
            points: points,
            calculations: calculations,
            color: this.colors.stepByStep,
            name: "Пошаговый алгоритм",
            description: "Простой алгоритм с равномерным шагом"
        };
    }

    // ==================== АЛГОРИТМ ЦДА ====================
    
    /**
     * Алгоритм Цифрового Дифференциального Анализатора (ЦДА)
     * @param {number} x1 - Начальная x координата
     * @param {number} y1 - Начальная y координата
     * @param {number} x2 - Конечная x координата
     * @param {number} y2 - Конечная y координата
     * @returns {Object} Объект с точками и вычислениями
     */
    ddaLine(x1, y1, x2, y2) {
        const points = [];
        const calculations = [];
        
        // 1. Вычисляем разницы
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        calculations.push(`1. dx = ${x2} - ${x1} = ${dx}, dy = ${y2} - ${y1} = ${dy}`);
        
        // 2. Определяем количество шагов
        let steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
        calculations.push(`2. steps = max(|${dx}|, |${dy}|) = ${steps}`);
        
        // 3. Вычисляем приращения
        const xIncrement = dx / steps;
        const yIncrement = dy / steps;
        calculations.push(`3. Xinc = ${dx}/${steps} = ${xIncrement.toFixed(3)}, Yinc = ${dy}/${steps} = ${yIncrement.toFixed(3)}`);
        
        // 4. Начальная точка
        let x = x1;
        let y = y1;
        
        calculations.push(`4. Начальная точка: (${Math.round(x)}, ${Math.round(y)})`);
        points.push({ x: Math.round(x), y: Math.round(y), step: 0 });
        
        // 5. Основной цикл (только целые шаги)
        for (let i = 1; i <= steps; i++) {
            x += xIncrement;
            y += yIncrement;
            
            // Округляем до ближайшего целого
            const roundedX = Math.round(x);
            const roundedY = Math.round(y);
            
            calculations.push(`${i+4}. Шаг ${i}: X = ${x.toFixed(3)}, Y = ${y.toFixed(3)} → (${roundedX}, ${roundedY})`);
            points.push({ 
                x: roundedX, 
                y: roundedY, 
                step: i,
                calculation: `X = ${x.toFixed(3)}, Y = ${y.toFixed(3)}`
            });
        }
        
        return {
            points: points,
            calculations: calculations,
            color: this.colors.dda,
            name: "Алгоритм ЦДА",
            description: "Цифровой Дифференциальный Анализатор"
        };
    }

    // ==================== АЛГОРИТМ БРЕЗЕНХЕМА ДЛЯ ОТРЕЗКОВ ====================
    
    /**
     * Алгоритм Брезенхема для отрезков
     * @param {number} x1 - Начальная x координата
     * @param {number} y1 - Начальная y координата
     * @param {number} x2 - Конечная x координата
     * @param {number} y2 - Конечная y координата
     * @returns {Object} Объект с точками и вычислениями
     */
    bresenhamLine(x1, y1, x2, y2) {
        const points = [];
        const calculations = [];
        
        // 1. Вычисляем абсолютные разницы
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        
        calculations.push(`1. |dx| = |${x2} - ${x1}| = ${dx}, |dy| = |${y2} - ${y1}| = ${dy}`);
        
        // 2. Определяем шаги по осям
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        
        calculations.push(`2. sx = ${sx}, sy = ${sy} (направление движения)`);
        
        // 3. Начальная точка
        let x = x1;
        let y = y1;
        
        calculations.push(`3. Начальная точка: (${x}, ${y})`);
        points.push({ x: x, y: y, step: 0, decision: "Начало" });
        
        // 4. Инициализация параметра решения
        let err = dx - dy;
        calculations.push(`4. Начальная ошибка: err = dx - dy = ${dx} - ${dy} = ${err}`);
        
        let step = 1;
        
        // 5. Основной цикл
        while (!(x === x2 && y === y2)) {
            const err2 = 2 * err;
            let decision = "";
            
            if (err2 > -dy) {
                err -= dy;
                x += sx;
                decision = `err2 = ${err2} > -dy = ${-dy} → сдвиг по X`;
            }
            
            if (err2 < dx) {
                err += dx;
                y += sy;
                decision += decision ? " и по Y" : `err2 = ${err2} < dx = ${dx} → сдвиг по Y`;
            }
            
            calculations.push(`${step+4}. Шаг ${step}: err = ${err}, (${x}, ${y}) - ${decision}`);
            points.push({ 
                x: x, 
                y: y, 
                step: step,
                decision: decision,
                err: err,
                err2: err2
            });
            
            step++;
        }
        
        return {
            points: points,
            calculations: calculations,
            color: this.colors.bresenhamLine,
            name: "Алгоритм Брезенхема (отрезки)",
            description: "Целочисленный алгоритм без операций с плавающей точкой"
        };
    }

    // ==================== АЛГОРИТМ БРЕЗЕНХЕМА ДЛЯ ОКРУЖНОСТЕЙ ====================
    
    /**
     * Алгоритм Брезенхема для окружностей
     * @param {number} cx - Центр окружности по X
     * @param {number} cy - Центр окружности по Y
     * @param {number} radius - Радиус окружности
     * @returns {Object} Объект с точками и вычислениями
     */
    bresenhamCircle(cx, cy, radius) {
        const points = [];
        const calculations = [];
        const allPoints = new Set(); // Для избежания дубликатов
        
        // 1. Инициализация
        let x = 0;
        let y = radius;
        let d = 3 - 2 * radius;
        
        calculations.push(`1. Инициализация: x = 0, y = R = ${radius}, d = 3 - 2*R = ${d}`);
        
        // Функция для добавления 8 симметричных точек
        const add8Points = (x, y, step) => {
            const symmetricPoints = [
                { x: cx + x, y: cy + y },
                { x: cx - x, y: cy + y },
                { x: cx + x, y: cy - y },
                { x: cx - x, y: cy - y },
                { x: cx + y, y: cy + x },
                { x: cx - y, y: cy + x },
                { x: cx + y, y: cy - x },
                { x: cx - y, y: cy - x }
            ];
            
            symmetricPoints.forEach(point => {
                const key = `${point.x},${point.y}`;
                if (!allPoints.has(key)) {
                    allPoints.add(key);
                    points.push({
                        x: point.x,
                        y: point.y,
                        step: step,
                        original: { x: x, y: y }
                    });
                }
            });
        };
        
        // 2. Первые точки
        calculations.push(`2. Добавляем первые 8 точек (x=${x}, y=${y})`);
        add8Points(x, y, 0);
        
        let step = 1;
        
        // 3. Основной цикл
        while (x <= y) {
            calculations.push(`${step+2}. Шаг ${step}: x = ${x}, y = ${y}, d = ${d}`);
            
            // Выбираем следующую точку
            if (d < 0) {
                d = d + 4 * x + 6;
                calculations.push(`   d < 0 → d = d + 4*x + 6 = ${d}`);
            } else {
                d = d + 4 * (x - y) + 10;
                y--;
                calculations.push(`   d >= 0 → d = d + 4*(x-y) + 10 = ${d}, y-- = ${y}`);
            }
            x++;
            
            // Добавляем точки для новой позиции
            add8Points(x, y, step);
            
            step++;
        }
        
        // Сортируем точки по шагу для пошаговой визуализации
        points.sort((a, b) => a.step - b.step);
        
        // Добавляем уникальный идентификатор для каждой точки
        points.forEach((point, index) => {
            point.id = index;
        });
        
        return {
            points: points,
            calculations: calculations,
            color: this.colors.bresenhamCircle,
            name: "Алгоритм Брезенхема (окружности)",
            description: "Построение окружности с использованием симметрии"
        };
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
    
    /**
     * Генерация тестового примера
     * @param {string} algorithmType - Тип алгоритма
     * @returns {Object} Параметры для алгоритма
     */
    getTestExample(algorithmType) {
        switch(algorithmType) {
            case 'stepByStep':
            case 'dda':
            case 'bresenhamLine':
                // Отрезок с наклоном
                return { x1: 2, y1: 3, x2: 12, y2: 8 };
                
            case 'bresenhamCircle':
                // Окружность
                return { cx: 15, cy: 15, radius: 10 };
                
            default:
                return { x1: 2, y1: 2, x2: 10, y2: 6 };
        }
    }

    /**
     * Получить описание алгоритма
     * @param {string} algorithmType - Тип алгоритма
     * @returns {Object} Описание алгоритма
     */
    getAlgorithmInfo(algorithmType) {
        const info = {
            stepByStep: {
                name: "Пошаговый алгоритм",
                description: "Простейший алгоритм с равномерным шагом по большей оси",
                formula: "X(i+1) = X(i) + ΔX/steps\nY(i+1) = Y(i) + ΔY/steps",
                complexity: "O(max(|Δx|, |Δy|))",
                advantages: "Простота реализации",
                disadvantages: "Использует операции с плавающей точкой"
            },
            dda: {
                name: "Алгоритм ЦДА",
                description: "Цифровой дифференциальный анализатор - улучшенная версия пошагового",
                formula: "X(i+1) = X(i) + dx/steps\nY(i+1) = Y(i) + dy/steps",
                complexity: "O(max(|dx|, |dy|))",
                advantages: "Простота, меньше ступенчатости",
                disadvantages: "Все еще использует float операции"
            },
            bresenhamLine: {
                name: "Алгоритм Брезенхема (отрезки)",
                description: "Целочисленный алгоритм без операций с плавающей точкой",
                formula: "err = 2*dy - dx\nПри err >= 0: y++, err -= 2*dx",
                complexity: "O(max(|dx|, |dy|))",
                advantages: "Только целочисленные операции, быстрый",
                disadvantages: "Сложнее для понимания"
            },
            bresenhamCircle: {
                name: "Алгоритм Брезенхема (окружности)",
                description: "Построение окружности с использованием 8-сторонней симметрии",
                formula: "d = 3 - 2*R\nПри d < 0: d += 4*x + 6\nИначе: d += 4*(x-y)+10, y--",
                complexity: "O(R)",
                advantages: "Только целочисленные операции, симметрия",
                disadvantages: "Только для целочисленных радиусов"
            }
        };
        
        return info[algorithmType] || info.stepByStep;
    }

    /**
     * Вычисление идеальной линии (для сравнения)
     * @param {number} x1 - Начальная x
     * @param {number} y1 - Начальная y
     * @param {number} x2 - Конечная x
     * @param {number} y2 - Конечная y
     * @returns {Array} Точки идеальной линии
     */
    calculateIdealLine(x1, y1, x2, y2) {
        const points = [];
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        if (dx === 0) {
            // Вертикальная линия
            const step = dy > 0 ? 1 : -1;
            for (let y = y1; y !== y2 + step; y += step) {
                points.push({ x: x1, y: y });
            }
        } else {
            // Наклонная линия
            const slope = dy / dx;
            const step = dx > 0 ? 1 : -1;
            
            for (let x = x1; x !== x2 + step; x += step) {
                const y = y1 + slope * (x - x1);
                points.push({ x: x, y: Math.round(y) });
            }
        }
        
        return points;
    }

    /**
     * Проверка, находится ли точка в пределах холста
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @param {number} width - Ширина холста
     * @param {number} height - Высота холста
     * @returns {boolean} true если точка в пределах
     */
    isPointInBounds(x, y, width, height) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }
}

// Экспорт класса для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RasterAlgorithms;
}