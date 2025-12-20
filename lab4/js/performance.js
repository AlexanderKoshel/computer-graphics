// js/performance.js
/**
 * Класс для измерения производительности
 */
class PerformanceMeasurer {
    constructor() {
        this.results = {};
        this.measurements = [];
    }
    
    /**
     * Измеряет время выполнения алгоритма
     */
    measureAlgorithm(algorithmFunc, ...args) {
        // Разогрев (warm-up)
        for (let i = 0; i < 10; i++) {
            algorithmFunc(...args);
        }
        
        // Основные измерения
        const measurements = [];
        const numRuns = 100;
        
        for (let i = 0; i < numRuns; i++) {
            const startTime = performance.now();
            const result = algorithmFunc(...args);
            const endTime = performance.now();
            
            measurements.push({
                time: endTime - startTime,
                points: result.points ? result.points.length : 0
            });
        }
        
        // Усредняем результаты
        const avgTime = measurements.reduce((sum, m) => sum + m.time, 0) / measurements.length;
        const avgPoints = measurements.reduce((sum, m) => sum + m.points, 0) / measurements.length;
        
        return {
            avgTime,
            avgPoints,
            measurements,
            efficiency: avgPoints / avgTime
        };
    }
    
    /**
     * Сравнивает все алгоритмы для отрезка
     */
    compareLineAlgorithms(x1, y1, x2, y2, algorithms) {
        const results = {};
        
        Object.keys(algorithms).forEach(algoName => {
            if (algoName !== 'bresenhamCircle') {
                results[algoName] = this.measureAlgorithm(algorithms[algoName], x1, y1, x2, y2);
            }
        });
        
        return results;
    }
    
    /**
     * Сравнивает алгоритмы для окружности
     */
    compareCircleAlgorithms(cx, cy, radius, algorithms) {
        const results = {};
        
        if (algorithms.bresenhamCircle) {
            results.bresenhamCircle = this.measureAlgorithm(
                algorithms.bresenhamCircle, 
                cx, cy, radius
            );
        }
        
        return results;
    }
    
    /**
     * Генерирует отчет о производительности
     */
    generateReport(results) {
        let report = 'Отчет о производительности алгоритмов\n';
        report += '='.repeat(50) + '\n\n';
        
        Object.keys(results).forEach(algoName => {
            const result = results[algoName];
            report += `${this.getAlgorithmName(algoName)}:\n`;
            report += `  Среднее время: ${result.avgTime.toFixed(4)} мс\n`;
            report += `  Среднее точек: ${result.avgPoints.toFixed(1)}\n`;
            report += `  Эффективность: ${result.efficiency.toFixed(2)} точек/мс\n`;
            report += `  Количество запусков: ${result.measurements.length}\n`;
            
            // Статистика
            const times = result.measurements.map(m => m.time);
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            const stdDev = this.calculateStdDev(times, result.avgTime);
            
            report += `  Мин. время: ${minTime.toFixed(4)} мс\n`;
            report += `  Макс. время: ${maxTime.toFixed(4)} мс\n`;
            report += `  Стандартное отклонение: ${stdDev.toFixed(4)} мс\n\n`;
        });
        
        // Сравнение
        if (Object.keys(results).length > 1) {
            report += 'Сравнение:\n';
            const algorithms = Object.keys(results);
            const fastest = algorithms.reduce((fastest, algo) => 
                results[algo].avgTime < results[fastest].avgTime ? algo : fastest
            );
            
            report += `  Самый быстрый: ${this.getAlgorithmName(fastest)} (${results[fastest].avgTime.toFixed(4)} мс)\n`;
            
            algorithms.forEach(algo => {
                if (algo !== fastest) {
                    const speedup = results[algo].avgTime / results[fastest].avgTime;
                    report += `  ${this.getAlgorithmName(algo)} медленнее в ${speedup.toFixed(2)} раз\n`;
                }
            });
        }
        
        return report;
    }
    
    /**
     * Рассчитывает стандартное отклонение
     */
    calculateStdDev(values, mean) {
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }
    
    /**
     * Получает читаемое имя алгоритма
     */
    getAlgorithmName(algorithmKey) {
        const names = {
            stepByStep: 'Пошаговый алгоритм',
            dda: 'Алгоритм ЦДА',
            bresenhamLine: 'Алгоритм Брезенхема (отрезки)',
            bresenhamCircle: 'Алгоритм Брезенхема (окружности)'
        };
        
        return names[algorithmKey] || algorithmKey;
    }
    
    /**
     * Экспортирует результаты в формате CSV
     */
    exportToCSV(results) {
        let csv = 'Алгоритм,Среднее время (мс),Точек,Эффективность (точек/мс)\n';
        
        Object.keys(results).forEach(algoName => {
            const result = results[algoName];
            csv += `${this.getAlgorithmName(algoName)},${result.avgTime.toFixed(4)},${result.avgPoints.toFixed(1)},${result.efficiency.toFixed(2)}\n`;
        });
        
        return csv;
    }
    
    /**
     * Создает визуализацию результатов
     */
    createVisualization(results, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        // Создаем canvas для графика
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // Рисуем график
        this.drawPerformanceChart(ctx, results);
    }
    
    /**
     * Рисует график производительности
     */
    drawPerformanceChart(ctx, results) {
        const algorithms = Object.keys(results);
        const barWidth = 40;
        const maxTime = Math.max(...algorithms.map(algo => results[algo].avgTime));
        const chartHeight = 300;
        const chartWidth = algorithms.length * 60;
        
        // Очищаем canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Рисуем оси
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(50, 20 + chartHeight);
        ctx.lineTo(50 + chartWidth, 20 + chartHeight);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Подписи оси Y
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i <= 5; i++) {
            const value = (maxTime / 5) * i;
            const y = 20 + chartHeight - (chartHeight / 5) * i;
            
            ctx.fillText(value.toFixed(2), 45, y);
            
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(50 + chartWidth, y);
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Рисуем столбцы
        algorithms.forEach((algo, index) => {
            const x = 60 + index * 60;
            const height = (results[algo].avgTime / maxTime) * chartHeight;
            const y = 20 + chartHeight - height;
            
            // Цвет столбца
            const colors = {
                stepByStep: '#FF6B6B',
                dda: '#4ECDC4',
                bresenhamLine: '#45B7D1',
                bresenhamCircle: '#96CEB4'
            };
            
            ctx.fillStyle = colors[algo] || '#ccc';
            ctx.fillRect(x, y, barWidth, height);
            
            // Подпись
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(this.getAlgorithmName(algo).split(' ')[0], x + barWidth / 2, 25 + chartHeight);
            
            // Значение
            ctx.fillText(results[algo].avgTime.toFixed(2) + ' мс', x + barWidth / 2, y - 15);
        });
        
        // Заголовок
        ctx.font = '16px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('Сравнение производительности алгоритмов', ctx.canvas.width / 2, 15);
        
        // Легенда
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        algorithms.forEach((algo, index) => {
            const y = 350 + index * 20;
            const colors = {
                stepByStep: '#FF6B6B',
                dda: '#4ECDC4',
                bresenhamLine: '#45B7D1',
                bresenhamCircle: '#96CEB4'
            };
            
            ctx.fillStyle = colors[algo] || '#ccc';
            ctx.fillRect(50, y, 15, 15);
            
            ctx.fillStyle = '#333';
            ctx.fillText(this.getAlgorithmName(algo), 70, y + 10);
        });
    }
}