import sys
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, 
    QHBoxLayout, QPushButton, QFileDialog, QLabel, QMessageBox
)
from PySide6.QtCore import Qt, QPointF
from PySide6.QtGui import QPainter, QPen, QColor, QFont
import math

class ClipArea:
    def __init__(self):
        self.reset()
    
    def reset(self):
        self.clip_rect = None
        self.segments = []
        self.clipped_segments = []
    
    def load_from_file(self, filename):
        self.reset()
        try:
            with open(filename, 'r') as f:
                lines = f.readlines()
                n = int(lines[0].strip())
                
                for i in range(1, n + 1):
                    coords = list(map(float, lines[i].split()))
                    if len(coords) >= 4:
                        self.segments.append(coords[:4])
                
                if len(lines) > n + 1:
                    rect_coords = list(map(float, lines[n + 1].split()))
                    if len(rect_coords) >= 4:
                        self.clip_rect = rect_coords[:4]
                        self.cohen_sutherland_clip()
        
        except Exception as e:
            print(f"Ошибка загрузки файла: {e}")
            return False
        return True
    
    def cohen_sutherland_clip(self):
        if not self.clip_rect:
            return
        
        xmin, ymin, xmax, ymax = self.clip_rect
        self.clipped_segments = []
        
        for segment in self.segments:
            x1, y1, x2, y2 = segment
            outcode1 = self.compute_outcode(x1, y1)
            outcode2 = self.compute_outcode(x2, y2)
            accept = False
            
            while True:
                if not (outcode1 | outcode2):
                    accept = True
                    break
                elif outcode1 & outcode2:
                    break
                else:
                    outcode_out = outcode1 if outcode1 else outcode2
                    
                    if outcode_out & 1:
                        x = xmin
                        y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1) if x2 != x1 else y1
                    elif outcode_out & 2:
                        x = xmax
                        y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1) if x2 != x1 else y1
                    elif outcode_out & 4:
                        y = ymin
                        x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1) if y2 != y1 else x1
                    elif outcode_out & 8:
                        y = ymax
                        x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1) if y2 != y1 else x1
                    
                    if outcode_out == outcode1:
                        x1, y1 = x, y
                        outcode1 = self.compute_outcode(x1, y1)
                    else:
                        x2, y2 = x, y
                        outcode2 = self.compute_outcode(x2, y2)
            
            if accept:
                self.clipped_segments.append([x1, y1, x2, y2])
    
    def compute_outcode(self, x, y):
        if not self.clip_rect:
            return 0
        
        xmin, ymin, xmax, ymax = self.clip_rect
        code = 0
        if x < xmin:
            code |= 1
        elif x > xmax:
            code |= 2
        if y < ymin:
            code |= 4
        elif y > ymax:
            code |= 8
        return code

class GraphicsWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.clip_area = ClipArea()
        self.setMinimumSize(800, 600)
        self.setAutoFillBackground(True)
        p = self.palette()
        p.setColor(self.backgroundRole(), Qt.black)
        self.setPalette(p)
        
        self.offset_x = 0
        self.offset_y = 0
        self.scale = 1.0
        self.grid_step = 10  # Шаг сетки
        self.show_grid = True
    
    def load_data(self, filename):
        if self.clip_area.load_from_file(filename):
            self.auto_scale()
            self.update()
            return True
        return False
    
    def auto_scale(self):
        if not self.clip_area.segments and not self.clip_area.clip_rect:
            return
        
        all_points = []
        for seg in self.clip_area.segments:
            all_points.extend([(seg[0], seg[1]), (seg[2], seg[3])])
        
        if self.clip_area.clip_rect:
            xmin, ymin, xmax, ymax = self.clip_area.clip_rect
            all_points.extend([(xmin, ymin), (xmax, ymax)])
        
        if all_points:
            min_x = min(p[0] for p in all_points)
            max_x = max(p[0] for p in all_points)
            min_y = min(p[1] for p in all_points)
            max_y = max(p[1] for p in all_points)
            
            # Добавляем отступы по краям (10%)
            padding_x = (max_x - min_x) * 0.1
            padding_y = (max_y - min_y) * 0.1
            
            min_x -= padding_x
            max_x += padding_x
            min_y -= padding_y
            max_y += padding_y
            
            width = max_x - min_x
            height = max_y - min_y
            
            if width > 0 and height > 0:
                # Автоматический расчет масштаба
                scale_x = (self.width() - 100) / width
                scale_y = (self.height() - 100) / height
                self.scale = min(scale_x, scale_y) * 0.9
                
                # Центрирование
                center_x = (min_x + max_x) / 2
                center_y = (min_y + max_y) / 2
                
                self.offset_x = -center_x * self.scale + self.width() / 2
                self.offset_y = -center_y * self.scale + self.height() / 2
                
                # Автоматический выбор шага сетки
                self.auto_grid_step(width, height)
    
    def auto_grid_step(self, data_width, data_height):
        # Автоматический расчет шага сетки на основе масштаба
        pixel_step = 50  # Желаемый шаг в пикселях
        data_step = pixel_step / self.scale
        
        # Округление до ближайшей "красивой" величины
        magnitude = 10 ** math.floor(math.log10(data_step))
        normalized = data_step / magnitude
        
        if normalized < 1.5:
            step = magnitude
        elif normalized < 3:
            step = 2 * magnitude
        elif normalized < 7:
            step = 5 * magnitude
        else:
            step = 10 * magnitude
        
        self.grid_step = max(0.1, step)  # Минимальный шаг 0.1
    
    def transform_point(self, x, y):
        screen_x = x * self.scale + self.offset_x
        screen_y = self.height() - (y * self.scale + self.offset_y)
        return QPointF(screen_x, screen_y)
    
    def inverse_transform(self, screen_x, screen_y):
        x = (screen_x - self.offset_x) / self.scale
        y = (self.height() - screen_y - self.offset_y) / self.scale
        return x, y
    
    def draw_axes(self, painter):
        pen = QPen(QColor(255, 255, 255), 1)
        painter.setPen(pen)
        
        # Определяем видимую область в мировых координатах
        left_world, top_world = self.inverse_transform(0, 0)
        right_world, bottom_world = self.inverse_transform(self.width(), self.height())
        
        # Центр осей в мировых координатах (ближайший к центру экрана)
        center_x = (left_world + right_world) / 2
        center_y = (top_world + bottom_world) / 2
        
        # Рисуем оси
        axis_pen = QPen(QColor(200, 200, 200), 2)
        painter.setPen(axis_pen)
        
        # Ось X
        y_zero_screen = self.transform_point(0, 0).y()
        painter.drawLine(0, y_zero_screen, self.width(), y_zero_screen)
        
        # Ось Y
        x_zero_screen = self.transform_point(0, 0).x()
        painter.drawLine(x_zero_screen, 0, x_zero_screen, self.height())
        
        # Сетка и отсечки
        grid_pen = QPen(QColor(100, 100, 100), 0.5)
        painter.setPen(grid_pen)
        
        font = QFont("Arial", 8)
        painter.setFont(font)
        
        # Отсечки на оси X
        start_x = math.ceil(left_world / self.grid_step) * self.grid_step
        end_x = math.floor(right_world / self.grid_step) * self.grid_step
        
        x = start_x
        while x <= end_x:
            screen_x = self.transform_point(x, 0).x()
            
            # Вертикальная линия сетки
            if self.show_grid:
                painter.drawLine(screen_x, 0, screen_x, self.height())
            
            # Отсечка на оси X
            painter.setPen(QPen(QColor(255, 255, 255), 2))
            painter.drawLine(screen_x, y_zero_screen - 5, screen_x, y_zero_screen + 5)
            
            # Подпись значения
            if abs(x) > 1e-10:  # Не показывать 0 на обеих осях
                value_text = f"{x:.1f}".rstrip('0').rstrip('.')
                painter.drawText(screen_x - 15, y_zero_screen + 20, value_text)
            
            painter.setPen(grid_pen)
            x += self.grid_step
        
        # Отсечки на оси Y
        start_y = math.ceil(bottom_world / self.grid_step) * self.grid_step
        end_y = math.floor(top_world / self.grid_step) * self.grid_step
        
        y = start_y
        while y <= end_y:
            screen_y = self.transform_point(0, y).y()
            
            # Горизонтальная линия сетки
            if self.show_grid:
                painter.drawLine(0, screen_y, self.width(), screen_y)
            
            # Отсечка на оси Y
            painter.setPen(QPen(QColor(255, 255, 255), 2))
            painter.drawLine(x_zero_screen - 5, screen_y, x_zero_screen + 5, screen_y)
            
            # Подпись значения
            if abs(y) > 1e-10:  # Не показывать 0 на обеих осях
                value_text = f"{y:.1f}".rstrip('0').rstrip('.')
                painter.drawText(x_zero_screen + 10, screen_y + 5, value_text)
            
            painter.setPen(grid_pen)
            y += self.grid_step
        
        # Стрелки осей
        arrow_pen = QPen(QColor(255, 255, 255), 2)
        painter.setPen(arrow_pen)
        
        arrow_size = 10
        # Стрелка оси X
        painter.drawLine(self.width() - arrow_size, y_zero_screen - arrow_size/2,
                        self.width(), y_zero_screen)
        painter.drawLine(self.width() - arrow_size, y_zero_screen + arrow_size/2,
                        self.width(), y_zero_screen)
        
        # Стрелка оси Y
        painter.drawLine(x_zero_screen - arrow_size/2, arrow_size,
                        x_zero_screen, 0)
        painter.drawLine(x_zero_screen + arrow_size/2, arrow_size,
                        x_zero_screen, 0)
        
        # Подписи осей
        font = QFont("Arial", 10, QFont.Bold)
        painter.setFont(font)
        painter.drawText(self.width() - 25, y_zero_screen - 10, "X")
        painter.drawText(x_zero_screen + 10, 15, "Y")
        
        # Надпись в центре
        painter.drawText(self.width() // 2 - 20, 20, "(0,0)")
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Оси координат с отсечками
        self.draw_axes(painter)
        
        # Отсекающее окно
        if self.clip_area.clip_rect:
            xmin, ymin, xmax, ymax = self.clip_area.clip_rect
            p1 = self.transform_point(xmin, ymin)
            p2 = self.transform_point(xmax, ymin)
            p3 = self.transform_point(xmax, ymax)
            p4 = self.transform_point(xmin, ymax)
            
            pen = QPen(QColor(0, 255, 255), 2)
            painter.setPen(pen)
            painter.drawPolygon([p1, p2, p3, p4])
        
        # Исходные отрезки
        pen = QPen(QColor(255, 100, 100), 1)
        painter.setPen(pen)
        for segment in self.clip_area.segments:
            x1, y1, x2, y2 = segment
            p1 = self.transform_point(x1, y1)
            p2 = self.transform_point(x2, y2)
            painter.drawLine(p1, p2)
        
        # Отсеченные отрезки
        pen = QPen(QColor(100, 255, 100), 3)
        painter.setPen(pen)
        for segment in self.clipped_segments:
            x1, y1, x2, y2 = segment
            p1 = self.transform_point(x1, y1)
            p2 = self.transform_point(x2, y2)
            painter.drawLine(p1, p2)
    
    def resizeEvent(self, event):
        # При изменении размера окна пересчитываем масштаб
        if self.clip_area.segments or self.clip_area.clip_rect:
            self.auto_scale()
        super().resizeEvent(event)
    
    @property
    def clipped_segments(self):
        return self.clip_area.clipped_segments

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Лабораторная работа 5 - Отсечение отрезков")
        self.setGeometry(100, 100, 1000, 700)
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QVBoxLayout(central_widget)
        
        # Панель управления
        control_layout = QHBoxLayout()
        
        self.btn_load = QPushButton("Загрузить файл")
        self.btn_load.clicked.connect(self.load_file)
        
        self.btn_reset = QPushButton("Сброс")
        self.btn_reset.clicked.connect(self.reset_view)
        
        self.label_status = QLabel("Готово к работе")
        self.label_status.setStyleSheet("color: white; padding: 5px;")
        
        control_layout.addWidget(self.btn_load)
        control_layout.addWidget(self.btn_reset)
        control_layout.addStretch()
        control_layout.addWidget(self.label_status)
        
        # Графический виджет
        self.graphics_widget = GraphicsWidget()
        
        # Информационная панель
        info_label = QLabel("Загрузите файл с данными в формате: n отрезков + прямоугольник отсечения")
        info_label.setStyleSheet("color: #888; padding: 5px; font-size: 10pt;")
        
        main_layout.addLayout(control_layout)
        main_layout.addWidget(self.graphics_widget)
        main_layout.addWidget(info_label)
        
        main_layout.setStretch(1, 1)
    
    def load_file(self):
        filename, _ = QFileDialog.getOpenFileName(
            self, "Выберите файл с данными", "", "Text Files (*.txt)"
        )
        
        if filename:
            if self.graphics_widget.load_data(filename):
                self.label_status.setText(f"Загружен файл: {filename.split('/')[-1]}")
            else:
                QMessageBox.warning(self, "Ошибка", "Не удалось загрузить файл")
                self.label_status.setText("Ошибка загрузки файла")
    
    def reset_view(self):
        self.graphics_widget.clip_area.reset()
        self.graphics_widget.update()
        self.label_status.setText("Сброс выполнен")

def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()