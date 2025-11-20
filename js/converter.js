class ColorConverter {

    constructor() {
        this.warningShown = false;
        this.updating = false;
        this.initEventListeners();
        this.updateFromRGB(255, 255, 255);
    }
    initEventListeners() {
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', (e) => this.handleSliderChange(e));
        });
        
        document.querySelectorAll('.input-fields input').forEach(input => {
            input.addEventListener('input', (e) => this.handleInputChange(e));
            input.addEventListener('change', (e) => this.handleInputChange(e));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleInputChange(e);
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    setTimeout(() => {
                        this.handleInputChange(e);
                    }, 0);
                }
            });
            input.addEventListener('blur', (e) => {
                this.handleInputChange(e);
            });
        });
        
        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.handleColorPickerChange(e);
        });
    }

    handleInputChange(event) {
        if (this.updating) return;
        
        const input = event.target;
        const model = input.dataset.model;
        const channel = input.dataset.channel;
        
        if (input.value === '' || input.value === '-') {
            return;
        }
        
        let value = parseFloat(input.value);
        
        if (isNaN(value)) {
            const currentValue = this.getCurrentModelValue(model, channel);
            input.value = this.formatValue(currentValue);
            return;
        }
    
        value = this.validateInputValue(model, channel, value);
        input.value = value;
        
        this.updateFromModel(model, channel, value);
    }

    getCurrentModelValue(model, channel) {
        const slider = document.querySelector(`[data-model="${model}"][data-channel="${channel}"]`);
        return slider ? parseFloat(slider.value) : 0;
    }
    handleSliderChange(event) {
        if (this.updating) return;
        
        const slider = event.target;
        const model = slider.dataset.model;
        const channel = slider.dataset.channel;
        const value = parseFloat(slider.value);
        this.updateFromModel(model, channel, value);
    }
    handleColorPickerChange(event) {
        if (this.updating) return;
        
        const hex = event.target.value;
        const rgb = this.hexToRGB(hex);
        this.updateFromRGB(rgb.r, rgb.g, rgb.b);
    }
    validateInputValue(model, channel, value) {
        const limits = {
            'cmyk': { c: [0, 100], m: [0, 100], y: [0, 100], k: [0, 100] },
            'lab': { l: [0, 100], a: [-128, 127], b: [-128, 127] },
            'hsv': { h: [0, 360], s: [0, 100], v: [0, 100] }
        };
        const [min, max] = limits[model][channel];
        
        if (value < min || value > max) {
            this.showWarning(`Значение ${channel.toUpperCase()} в модели ${model.toUpperCase()} вышло за допустимые границы и будет приближено`);
            return Math.max(min, Math.min(max, value));
        }
        
        return value;
    }
    updateFromModel(model, changedChannel, changedValue) {
        let rgb;
        switch (model) {
            case 'cmyk':
                rgb = this.cmykToRGB(this.getCMYKValues());
                break;
            case 'lab':
                rgb = this.labToRGB(this.getLABValues());
                break;
            case 'hsv':
                rgb = this.hsvToRGB(this.getHSVValues());
                break;
        }
        this.updateAllModels(rgb);
    }
    getCMYKValues() {
        return {
            c: parseFloat(document.querySelector('[data-model="cmyk"][data-channel="c"]').value),
            m: parseFloat(document.querySelector('[data-model="cmyk"][data-channel="m"]').value),
            y: parseFloat(document.querySelector('[data-model="cmyk"][data-channel="y"]').value),
            k: parseFloat(document.querySelector('[data-model="cmyk"][data-channel="k"]').value)
        };
    }
    getLABValues() {
        return {
            l: parseFloat(document.querySelector('[data-model="lab"][data-channel="l"]').value),
            a: parseFloat(document.querySelector('[data-model="lab"][data-channel="a"]').value),
            b: parseFloat(document.querySelector('[data-model="lab"][data-channel="b"]').value)
        };
    }
    getHSVValues() {
        return {
            h: parseFloat(document.querySelector('[data-model="hsv"][data-channel="h"]').value),
            s: parseFloat(document.querySelector('[data-model="hsv"][data-channel="s"]').value),
            v: parseFloat(document.querySelector('[data-model="hsv"][data-channel="v"]').value)
        };
    }
    
    rgbToCMYK(r, g, b) {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        const k = 1 - Math.max(r, g, b);
        
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }
    cmykToRGB(cmyk) {
        const c = cmyk.c / 100;
        const m = cmyk.m / 100;
        const y = cmyk.y / 100;
        const k = cmyk.k / 100;
        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);
        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b)
        };
    }
    rgbToHSV(r, g, b) {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let h = 0;
        let s = max === 0 ? 0 : delta / max;
        let v = max;
        if (delta !== 0) {
            switch (max) {
                case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
                case g: h = (b - r) / delta + 2; break;
                case b: h = (r - g) / delta + 4; break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }
    hsvToRGB(hsv) {
        const h = hsv.h / 360;
        const s = hsv.s / 100;
        const v = hsv.v / 100;
        let r, g, b;
        if (s === 0) {
            r = g = b = v;
        } else {
            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    rgbToXYZ(r, g, b) {
        let rLin = r / 255;
        let gLin = g / 255;
        let bLin = b / 255;
        rLin = rLin > 0.04045 ? Math.pow((rLin + 0.055) / 1.055, 2.4) : rLin / 12.92;
        gLin = gLin > 0.04045 ? Math.pow((gLin + 0.055) / 1.055, 2.4) : gLin / 12.92;
        bLin = bLin > 0.04045 ? Math.pow((bLin + 0.055) / 1.055, 2.4) : bLin / 12.92;
        const x = rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375;
        const y = rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750;
        const z = rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041;
        return { x: x * 100, y: y * 100, z: z * 100 };
    }
    xyzToRGB(xyz) {
        const x = xyz.x / 100;
        const y = xyz.y / 100;
        const z = xyz.z / 100;
        let rLin = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
        let gLin = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
        let bLin = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
        rLin = rLin > 0.0031308 ? 1.055 * Math.pow(rLin, 1/2.4) - 0.055 : 12.92 * rLin;
        gLin = gLin > 0.0031308 ? 1.055 * Math.pow(gLin, 1/2.4) - 0.055 : 12.92 * gLin;
        bLin = bLin > 0.0031308 ? 1.055 * Math.pow(bLin, 1/2.4) - 0.055 : 12.92 * bLin;
        return {
            r: Math.round(Math.max(0, Math.min(1, rLin)) * 255),
            g: Math.round(Math.max(0, Math.min(1, gLin)) * 255),
            b: Math.round(Math.max(0, Math.min(1, bLin)) * 255)
        };
    }
    xyzToLAB(xyz) {
        const refX = 95.047;
        const refY = 100.000;
        const refZ = 108.883;
        const x = xyz.x / refX;
        const y = xyz.y / refY;
        const z = xyz.z / refZ;
        const f = (t) => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + (16/116);
        const fx = f(x);
        const fy = f(y);
        const fz = f(z);
        const l = Math.max(0, 116 * fy - 16);
        const a = 500 * (fx - fy);
        const b = 200 * (fy - fz);
        return {
            l: Math.round(l * 100) / 100,
            a: Math.round(a * 100) / 100,
            b: Math.round(b * 100) / 100
        };
    }
    labToXYZ(lab) {
        const refX = 95.047;
        const refY = 100.000;
        const refZ = 108.883;
        const l = lab.l;
        const a = lab.a;
        const b = lab.b;
        const fy = (l + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - b / 200;
        const fInv = (t) => {
            const t3 = Math.pow(t, 3);
            return t3 > 0.008856 ? t3 : (t - 16/116) / 7.787;
        };
        const x = refX * fInv(fx);
        const y = refY * fInv(fy);
        const z = refZ * fInv(fz);
        return { x, y, z };
    }
    labToRGB(lab) {
        const xyz = this.labToXYZ(lab);
        return this.xyzToRGB(xyz);
    }
    rgbToLAB(r, g, b) {
        const xyz = this.rgbToXYZ(r, g, b);
        return this.xyzToLAB(xyz);
    }
    updateAllModels(rgb) {
        this.updating = true;
        this.updateColorPreview(rgb);
        const cmyk = this.rgbToCMYK(rgb.r, rgb.g, rgb.b);
        const lab = this.rgbToLAB(rgb.r, rgb.g, rgb.b);
        const hsv = this.rgbToHSV(rgb.r, rgb.g, rgb.b);
        this.updateModelUI('cmyk', cmyk);
        this.updateModelUI('lab', lab);
        this.updateModelUI('hsv', hsv);
        document.getElementById('colorPicker').value = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        this.updating = false;
    }
    updateModelUI(model, values) {
        for (const [channel, value] of Object.entries(values)) {
            const slider = document.querySelector(`[data-model="${model}"][data-channel="${channel}"]`);
            if (slider) {
                slider.value = value;
            }
            const valueSpan = document.getElementById(`${model}${channel.toUpperCase()}Value`);
            if (valueSpan) {
                valueSpan.textContent = this.formatValue(value);
            }
            const input = document.querySelector(`.input-fields input[data-model="${model}"][data-channel="${channel}"]`);
            if (input) {
                input.value = this.formatValue(value);
            }
        }
    }
    updateColorPreview(rgb) {
        const preview = document.getElementById('colorPreview');
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        preview.style.backgroundColor = hex;
        document.getElementById('colorHex').textContent = hex.toUpperCase();
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        document.getElementById('colorHex').style.color = brightness > 128 ? '#000000' : '#FFFFFF';
    }
    formatValue(value) {
        if (Number.isInteger(value)) {
            return value;
        }
        return Math.round(value * 100) / 100;
    }
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    hexToRGB(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    updateFromRGB(r, g, b) {
        this.updateAllModels({ r, g, b });
    }
    showWarning(message) {
        const warning = document.getElementById('warning');
        warning.textContent = message;
        warning.style.display = 'block';
        this.warningShown = true;
        
        setTimeout(() => {
            warning.style.display = 'none';
            this.warningShown = false;
        }, 3000);
    }
    checkBounds(value, min, max, model, channel) {
        if (value < min || value > max) {
            this.showWarning(`⚠️ Значение ${channel} в модели ${model} вышло за допустимые границы`);
            return Math.max(min, Math.min(max, value));
        }
        return value;
    }
    }
    document.addEventListener('DOMContentLoaded', () => {
        new ColorConverter();
    });