document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const resultsBody = document.getElementById('results-body');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const fileCount = document.getElementById('file-count');
    const stats = document.getElementById('stats');
    const totalFiles = document.getElementById('total-files');
    const totalSize = document.getElementById('total-size');
    const processingTime = document.getElementById('processing-time');
    const loadFolderBtn = document.getElementById('load-folder');
    const folderPath = document.getElementById('folder-path');

    // Обработка перетаскивания файлов
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // Обработка выбора файлов через input
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Обработка кнопки загрузки из папки (демо-функция)
    loadFolderBtn.addEventListener('click', function() {
        if (folderPath.value.trim()) {
            // В реальном приложении здесь был бы запрос к серверу
            // для получения файлов из указанной папки
            alert('В реальном приложении здесь будет загрузка файлов из папки: ' + folderPath.value);
            // Для демонстрации создадим несколько тестовых файлов
            createDemoFiles();
        } else {
            alert('Введите путь к папке');
        }
    });

    // Функция обработки файлов
    function handleFiles(files) {
        if (files.length === 0) return;
        
        // Ограничение на количество файлов (для демонстрации)
        if (files.length > 100) {
            alert('Для демонстрации ограничение 100 файлов. Выбрано: ' + files.length);
            return;
        }
        
        // Очистка предыдущих результатов
        resultsBody.innerHTML = '';
        stats.style.display = 'none';
        
        // Показ прогресс-бара
        progressBar.style.display = 'block';
        progress.style.width = '0%';
        fileCount.textContent = `Обработано 0 из ${files.length} файлов`;
        
        const startTime = performance.now();
        let processedFiles = 0;
        let totalFileSize = 0;
        
        // Обработка каждого файла
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            totalFileSize += file.size;
            
            // Используем FileReader для чтения файла
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const fileInfo = extractFileInfo(file, e.target.result);
                    displayFileInfo(fileInfo);
                } catch (error) {
                    console.error('Ошибка обработки файла:', file.name, error);
                    displayFileInfo({
                        name: file.name,
                        error: 'Ошибка обработки файла'
                    });
                }
                
                processedFiles++;
                updateProgress(processedFiles, files.length);
                
                // Если все файлы обработаны
                if (processedFiles === files.length) {
                    const endTime = performance.now();
                    const processingTimeMs = Math.round(endTime - startTime);
                    
                    // Обновление статистики
                    updateStats(files.length, formatFileSize(totalFileSize), processingTimeMs);
                    stats.style.display = 'flex';
                }
            };
            
            reader.onerror = function() {
                console.error('Ошибка чтения файла:', file.name);
                displayFileInfo({
                    name: file.name,
                    error: 'Ошибка чтения файла'
                });
                
                processedFiles++;
                updateProgress(processedFiles, files.length);
                
                if (processedFiles === files.length) {
                    const endTime = performance.now();
                    const processingTimeMs = Math.round(endTime - startTime);
                    updateStats(files.length, formatFileSize(totalFileSize), processingTimeMs);
                    stats.style.display = 'flex';
                }
            };
            
            // Чтение файла как ArrayBuffer для бинарных форматов
            if (file.type.startsWith('image/')) {
                reader.readAsArrayBuffer(file);
            } else {
                // Для неизвестных форматов пытаемся прочитать как бинарные данные
                reader.readAsArrayBuffer(file);
            }
        }
    }

    // Функция извлечения информации о файле
    function extractFileInfo(file, arrayBuffer) {
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };
        
        // Создаем DataView для работы с бинарными данными
        const dataView = new DataView(arrayBuffer);
        
        // Определяем тип файла по сигнатуре (первые несколько байт)
        const fileType = detectFileType(dataView);
        
        // Извлекаем информацию в зависимости от типа файла
        switch (fileType) {
            case 'JPEG':
                return extractJPEGInfo(fileInfo, dataView);
            case 'PNG':
                return extractPNGInfo(fileInfo, dataView);
            case 'GIF':
                return extractGIFInfo(fileInfo, dataView);
            case 'BMP':
                return extractBMPInfo(fileInfo, dataView);
            case 'TIFF':
                return extractTIFFInfo(fileInfo, dataView);
            case 'PCX':
                return extractPCXInfo(fileInfo, dataView);
            default:
                fileInfo.error = 'Неподдерживаемый формат файла';
                return fileInfo;
        }
    }

    // Функция определения типа файла по сигнатуре
    function detectFileType(dataView) {
        // JPEG: FF D8 FF
        if (dataView.getUint16(0) === 0xFFD8) {
            return 'JPEG';
        }
        
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (dataView.getUint32(0) === 0x89504E47 && dataView.getUint32(4) === 0x0D0A1A0A) {
            return 'PNG';
        }
        
        // GIF: GIF87a или GIF89a
        const gifHeader = String.fromCharCode(
            dataView.getUint8(0),
            dataView.getUint8(1),
            dataView.getUint8(2),
            dataView.getUint8(3),
            dataView.getUint8(4),
            dataView.getUint8(5)
        );
        if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
            return 'GIF';
        }
        
        // BMP: BM
        if (dataView.getUint16(0) === 0x424D) {
            return 'BMP';
        }
        
        // TIFF: II (little endian) или MM (big endian)
        const tiffHeader = dataView.getUint16(0);
        if (tiffHeader === 0x4949 || tiffHeader === 0x4D4D) {
            return 'TIFF';
        }
        
        // PCX: 0x0A
        if (dataView.getUint8(0) === 0x0A) {
            return 'PCX';
        }
        
        return 'UNKNOWN';
    }

    // Функции извлечения информации для различных форматов
    function extractJPEGInfo(fileInfo, dataView) {
        // Для JPEG информация извлекается из сегментов SOF и APP
        let offset = 2; // Пропускаем сигнатуру FF D8
        
        while (offset < dataView.byteLength - 1) {
            const marker = dataView.getUint16(offset);
            offset += 2;
            
            // Конец файла
            if (marker === 0xFFD9) break;
            
            // Пропускаем маркеры без длины
            if (marker === 0xFFD8 || (marker >= 0xFFD0 && marker <= 0xFFD7)) {
                continue;
            }
            
            // Получаем длину сегмента
            const length = dataView.getUint16(offset);
            offset += 2;
            
            // SOF0 (Start of Frame, baseline DCT)
            if (marker === 0xFFC0) {
                fileInfo.precision = dataView.getUint8(offset);
                fileInfo.height = dataView.getUint16(offset + 1);
                fileInfo.width = dataView.getUint16(offset + 3);
                fileInfo.components = dataView.getUint8(offset + 5);
                fileInfo.colorDepth = fileInfo.components * 8; // Обычно 24 бита для RGB
                fileInfo.compression = 'JPEG (DCT)';
                break;
            }
            
            // APP0 (JFIF)
            if (marker === 0xFFE0) {
                const identifier = String.fromCharCode(
                    dataView.getUint8(offset),
                    dataView.getUint8(offset + 1),
                    dataView.getUint8(offset + 2),
                    dataView.getUint8(offset + 3),
                    dataView.getUint8(offset + 4)
                );
                
                if (identifier === 'JFIF\0') {
                    // Единицы разрешения
                    const units = dataView.getUint8(offset + 7);
                    fileInfo.xDensity = dataView.getUint16(offset + 8);
                    fileInfo.yDensity = dataView.getUint16(offset + 10);
                    
                    if (units === 1) {
                        fileInfo.resolution = `${fileInfo.xDensity} x ${fileInfo.yDensity} DPI`;
                    } else if (units === 2) {
                        fileInfo.resolution = `${fileInfo.xDensity} x ${fileInfo.yDensity} DPC`;
                    } else {
                        fileInfo.resolution = 'Не указано';
                    }
                }
            }
            
            offset += length - 2; // Переходим к следующему сегменту
        }
        
        // Дополнительная информация для JPEG
        fileInfo.additionalInfo = `Компоненты: ${fileInfo.components || 'N/A'}`;
        
        return fileInfo;
    }

    function extractPNGInfo(fileInfo, dataView) {
        // Для PNG информация находится в chunk'е IHDR
        const width = dataView.getUint32(16);
        const height = dataView.getUint32(20);
        const bitDepth = dataView.getUint8(24);
        const colorType = dataView.getUint8(25);
        const compression = dataView.getUint8(26);
        const filter = dataView.getUint8(27);
        const interlace = dataView.getUint8(28);
        
        fileInfo.width = width;
        fileInfo.height = height;
        fileInfo.colorDepth = bitDepth;
        
        // Определяем тип цвета
        let colorTypeStr = '';
        switch (colorType) {
            case 0: colorTypeStr = 'Оттенки серого'; break;
            case 2: colorTypeStr = 'RGB'; break;
            case 3: colorTypeStr = 'Палитра'; break;
            case 4: colorTypeStr = 'Оттенки серого + Alpha'; break;
            case 6: colorTypeStr = 'RGB + Alpha'; break;
            default: colorTypeStr = 'Неизвестно';
        }
        
        fileInfo.compression = 'Deflate';
        
        // Разрешение может быть в chunk'е pHYs
        let offset = 33; // После IHDR
        while (offset < dataView.byteLength - 8) {
            const chunkLength = dataView.getUint32(offset);
            const chunkType = String.fromCharCode(
                dataView.getUint8(offset + 4),
                dataView.getUint8(offset + 5),
                dataView.getUint8(offset + 6),
                dataView.getUint8(offset + 7)
            );
            
            if (chunkType === 'pHYs') {
                const xPixels = dataView.getUint32(offset + 8);
                const yPixels = dataView.getUint32(offset + 12);
                const unit = dataView.getUint8(offset + 16);
                
                if (unit === 1) {
                    fileInfo.resolution = `${xPixels/100} x ${yPixels/100} DPI`; // pixels per meter to DPI
                } else {
                    fileInfo.resolution = `${xPixels} x ${yPixels} (единицы не указаны)`;
                }
                break;
            }
            
            offset += 12 + chunkLength;
        }
        
        if (!fileInfo.resolution) {
            fileInfo.resolution = 'Не указано';
        }
        
        fileInfo.additionalInfo = `Тип цвета: ${colorTypeStr}, Фильтр: ${filter}, Чересстрочность: ${interlace ? 'Да' : 'Нет'}`;
        
        return fileInfo;
    }

    function extractGIFInfo(fileInfo, dataView) {
        const width = dataView.getUint16(6, true); 
        const height = dataView.getUint16(8, true);
        
        const packed = dataView.getUint8(10);
        const globalColorTable = (packed & 0x80) !== 0;
        const colorResolution = ((packed & 0x70) >> 4) + 1;
        const sorted = (packed & 0x08) !== 0;
        const globalColorTableSize = 2 << (packed & 0x07);
        
        fileInfo.width = width;
        fileInfo.height = height;
        fileInfo.colorDepth = colorResolution;
        fileInfo.compression = 'LZW';
        
        fileInfo.resolution = 'Не указано';
        
        fileInfo.additionalInfo = `Цветовая палитра: ${globalColorTable ? 'Да' : 'Нет'}, Цветов: ${globalColorTableSize}`;
        
        return fileInfo;
    }

    function extractBMPInfo(fileInfo, dataView) {
        const headerSize = dataView.getUint32(14, true);
        
        if (headerSize === 12) {
            fileInfo.width = dataView.getUint16(18, true);
            fileInfo.height = dataView.getUint16(20, true);
            fileInfo.colorDepth = dataView.getUint16(24, true);
        } else {
            fileInfo.width = dataView.getUint32(18, true);
            fileInfo.height = dataView.getUint32(22, true);
            fileInfo.colorDepth = dataView.getUint16(28, true);
            
            const xPixelsPerMeter = dataView.getUint32(38, true);
            const yPixelsPerMeter = dataView.getUint32(42, true);
            
            if (xPixelsPerMeter > 0 && yPixelsPerMeter > 0) {
                fileInfo.resolution = `${Math.round(xPixelsPerMeter / 39.37)} x ${Math.round(yPixelsPerMeter / 39.37)} DPI`;
            } else {
                fileInfo.resolution = 'Не указано';
            }
        }
        
        fileInfo.compression = 'RLE или без сжатия';
        
        if (!fileInfo.resolution) {
            fileInfo.resolution = 'Не указано';
        }
        
        fileInfo.additionalInfo = `Размер заголовка: ${headerSize} байт`;
        
        return fileInfo;
    }

    function extractTIFFInfo(fileInfo, dataView) {
        const littleEndian = dataView.getUint16(0) === 0x4949;
        
        const ifdOffset = dataView.getUint32(4, littleEndian);
        
        const entryCount = dataView.getUint16(ifdOffset, littleEndian);
        
        for (let i = 0; i < entryCount; i++) {
            const entryOffset = ifdOffset + 2 + i * 12;
            const tag = dataView.getUint16(entryOffset, littleEndian);
            
            switch (tag) {
                case 256:
                    fileInfo.width = getTiffValue(dataView, entryOffset, littleEndian);
                    break;
                case 257:
                    fileInfo.height = getTiffValue(dataView, entryOffset, littleEndian);
                    break;
                case 258:
                    fileInfo.colorDepth = getTiffValue(dataView, entryOffset, littleEndian);
                    break;
                case 259:
                    const compression = getTiffValue(dataView, entryOffset, littleEndian);
                    fileInfo.compression = compression === 1 ? 'Без сжатия' : 
                                         compression === 5 ? 'LZW' : 
                                         compression === 6 ? 'JPEG' : 
                                         `Код: ${compression}`;
                    break;
                case 282:
                    fileInfo.xResolution = getTiffRational(dataView, entryOffset, littleEndian);
                    break;
                case 283:
                    fileInfo.yResolution = getTiffRational(dataView, entryOffset, littleEndian);
                    break;
                case 296:
                    const unit = getTiffValue(dataView, entryOffset, littleEndian);
                    if (unit === 2 && fileInfo.xResolution && fileInfo.yResolution) {
                        fileInfo.resolution = `${Math.round(fileInfo.xResolution)} x ${Math.round(fileInfo.yResolution)} DPI`;
                    }
                    break;
            }
        }
        
        if (!fileInfo.resolution) {
            fileInfo.resolution = 'Не указано';
        }
        
        fileInfo.additionalInfo = `Порядок байт: ${littleEndian ? 'Little-endian' : 'Big-endian'}`;
        
        return fileInfo;
    }

    function extractPCXInfo(fileInfo, dataView) {
        fileInfo.width = dataView.getUint16(8, true) - dataView.getUint16(4, true) + 1;
        fileInfo.height = dataView.getUint16(10, true) - dataView.getUint16(6, true) + 1;
        
        const bitsPerPixel = dataView.getUint8(3);
        const colorPlanes = dataView.getUint8(65);
        fileInfo.colorDepth = bitsPerPixel * colorPlanes;
        
        const xDpi = dataView.getUint16(12, true);
        const yDpi = dataView.getUint16(14, true);
        fileInfo.resolution = `${xDpi} x ${yDpi} DPI`;
        
        fileInfo.compression = 'RLE';
        
        fileInfo.additionalInfo = `Битов на пиксель: ${bitsPerPixel}, Плоскостей цвета: ${colorPlanes}`;
        
        return fileInfo;
    }

    function getTiffValue(dataView, entryOffset, littleEndian) {
        const type = dataView.getUint16(entryOffset + 2, littleEndian);
        const count = dataView.getUint32(entryOffset + 4, littleEndian);
        
        if (count === 1) {
            switch (type) {
                case 1:
                case 6:
                    return dataView.getUint8(entryOffset + 8, littleEndian);
                case 3: 
                    return dataView.getUint16(entryOffset + 8, littleEndian);
                case 4:
                case 9:
                    return dataView.getUint32(entryOffset + 8, littleEndian);
            }
        }
        
        return null;
    }

    function getTiffRational(dataView, entryOffset, littleEndian) {
        const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian);
        const numerator = dataView.getUint32(valueOffset, littleEndian);
        const denominator = dataView.getUint32(valueOffset + 4, littleEndian);
        
        return denominator !== 0 ? numerator / denominator : 0;
    }

    function displayFileInfo(fileInfo) {
        const row = document.createElement('tr');
        
        if (fileInfo.error) {
            row.innerHTML = `
                <td class="file-name">${fileInfo.name}</td>
                <td colspan="5" class="error">${fileInfo.error}</td>
            `;
        } else {
            row.innerHTML = `
                <td class="file-name">${fileInfo.name}</td>
                <td>${fileInfo.width || 'N/A'} x ${fileInfo.height || 'N/A'}</td>
                <td>${fileInfo.resolution || 'Не указано'}</td>
                <td>${fileInfo.colorDepth || 'N/A'} бит</td>
                <td>${fileInfo.compression || 'N/A'}</td>
                <td>
                    <div class="file-info">
                        <span>${fileInfo.type || 'Неизвестный тип'}</span>
                        ${fileInfo.additionalInfo ? `<span>${fileInfo.additionalInfo}</span>` : ''}
                    </div>
                </td>
            `;
        }
        
        resultsBody.appendChild(row);
    }

    function updateProgress(processed, total) {
        const percent = Math.round((processed / total) * 100);
        progress.style.width = `${percent}%`;
        fileCount.textContent = `Обработано ${processed} из ${total} файлов`;
    }

    function updateStats(files, size, time) {
        totalFiles.textContent = files;
        totalSize.textContent = size;
        processingTime.textContent = time;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function createDemoFiles() {
        alert('В реальном приложении здесь будет загрузка файлов из папки. Для демонстрации созданы тестовые данные.');
        
        resultsBody.innerHTML = '';
        stats.style.display = 'none';
        
        const demoFiles = [
            {
                name: 'example.jpg',
                width: 1920,
                height: 1080,
                resolution: '300 x 300 DPI',
                colorDepth: 24,
                compression: 'JPEG (DCT)',
                type: 'image/jpeg',
                additionalInfo: 'Компоненты: 3'
            },
            {
                name: 'photo.png',
                width: 800,
                height: 600,
                resolution: '72 x 72 DPI',
                colorDepth: 32,
                compression: 'Deflate',
                type: 'image/png',
                additionalInfo: 'Тип цвета: RGB + Alpha'
            },
            {
                name: 'animation.gif',
                width: 640,
                height: 480,
                resolution: 'Не указано',
                colorDepth: 8,
                compression: 'LZW',
                type: 'image/gif',
                additionalInfo: 'Цветовая палитра: Да, Цветов: 256'
            },
            {
                name: 'image.bmp',
                width: 1024,
                height: 768,
                resolution: '96 x 96 DPI',
                colorDepth: 24,
                compression: 'Без сжатия',
                type: 'image/bmp',
                additionalInfo: 'Размер заголовка: 40 байт'
            },
            {
                name: 'scan.tif',
                width: 2480,
                height: 3508,
                resolution: '300 x 300 DPI',
                colorDepth: 8,
                compression: 'LZW',
                type: 'image/tiff',
                additionalInfo: 'Порядок байт: Little-endian'
            }
        ];
        
        demoFiles.forEach(fileInfo => {
            displayFileInfo(fileInfo);
        });
        
        updateStats(demoFiles.length, '2.4 МБ', 150);
        stats.style.display = 'flex';
    }
});