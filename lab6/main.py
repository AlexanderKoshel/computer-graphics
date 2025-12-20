import sys
import math
import numpy as np
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QSlider, QGroupBox, QGridLayout,
    QRadioButton
)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QPainter, QPen, QColor, QFont

class ThreeDObject:
    def __init__(self):
        self.vertices = []
        self.edges = []
        
    def create_letter_a(self):
        self.vertices = [
            [-1, 0, -0.5], [1, 0, -0.5], [1, 3, -0.5], [-1, 3, -0.5],
            [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 1.5, -0.5], [-0.5, 1.5, -0.5],
            [-1, 0, 0.5], [1, 0, 0.5], [1, 3, 0.5], [-1, 3, 0.5],
            [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 1.5, 0.5], [-0.5, 1.5, 0.5]
        ]
        
        self.edges = [
            (0,1),(1,2),(2,3),(3,0),
            (4,5),(5,6),(6,7),(7,4),
            (0,4),(1,5),(2,6),(3,7),
            (8,9),(9,10),(10,11),(11,8),
            (12,13),(13,14),(14,15),(15,12),
            (8,12),(9,13),(10,14),(11,15),
            (0,8),(1,9),(2,10),(3,11),
            (4,12),(5,13),(6,14),(7,15)
        ]

class ThreeDWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.setMinimumSize(600, 600)
        
        self.object_3d = ThreeDObject()
        self.object_3d.create_letter_a()
        
        self.transform_matrix = np.eye(4)
        self.projection_matrix = np.eye(4)
        
        self.rotation_x = 0
        self.rotation_y = 0
        self.rotation_z = 0
        self.scale = 1.0
        self.translation = [0, 0, 0]
        
        self.projection_type = "perspective"
        self.show_projections = False
        
        self.auto_rotation = False
        self.timer = QTimer()
        self.timer.timeout.connect(self.auto_rotate)
        
        self.setup_matrices()
    
    def setup_matrices(self):
        self.update_transform_matrix()
        self.update_projection_matrix()
    
    def update_transform_matrix(self):
        self.transform_matrix = np.eye(4)
        
        translation_matrix = np.array([
            [1, 0, 0, self.translation[0]],
            [0, 1, 0, self.translation[1]],
            [0, 0, 1, self.translation[2]],
            [0, 0, 0, 1]
        ])
        
        scale_matrix = np.array([
            [self.scale, 0, 0, 0],
            [0, self.scale, 0, 0],
            [0, 0, self.scale, 0],
            [0, 0, 0, 1]
        ])
        
        rx = math.radians(self.rotation_x)
        ry = math.radians(self.rotation_y)
        rz = math.radians(self.rotation_z)
        
        rx_matrix = np.array([
            [1, 0, 0, 0],
            [0, math.cos(rx), -math.sin(rx), 0],
            [0, math.sin(rx), math.cos(rx), 0],
            [0, 0, 0, 1]
        ])
        
        ry_matrix = np.array([
            [math.cos(ry), 0, math.sin(ry), 0],
            [0, 1, 0, 0],
            [-math.sin(ry), 0, math.cos(ry), 0],
            [0, 0, 0, 1]
        ])
        
        rz_matrix = np.array([
            [math.cos(rz), -math.sin(rz), 0, 0],
            [math.sin(rz), math.cos(rz), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
        
        rotation_matrix = rz_matrix @ ry_matrix @ rx_matrix
        self.transform_matrix = translation_matrix @ rotation_matrix @ scale_matrix
    
    def update_projection_matrix(self):
        if self.projection_type == "perspective":
            fov = math.radians(45)
            aspect = self.width() / max(self.height(), 1)
            near = 0.1
            far = 100.0
            
            f = 1.0 / math.tan(fov / 2)
            self.projection_matrix = np.array([
                [f/aspect, 0, 0, 0],
                [0, f, 0, 0],
                [0, 0, (far+near)/(near-far), (2*far*near)/(near-far)],
                [0, 0, -1, 0]
            ])
        else:
            left = -2
            right = 2
            bottom = -2
            top = 2
            near = -10
            far = 10
            
            self.projection_matrix = np.array([
                [2/(right-left), 0, 0, -(right+left)/(right-left)],
                [0, 2/(top-bottom), 0, -(top+bottom)/(top-bottom)],
                [0, 0, -2/(far-near), -(far+near)/(far-near)],
                [0, 0, 0, 1]
            ])
    
    def project_point(self, point):
        point_4d = np.array([point[0], point[1], point[2], 1])
        transformed = self.transform_matrix @ point_4d
        projected = self.projection_matrix @ transformed
        
        if projected[3] != 0:
            projected = projected / projected[3]
        
        x = (projected[0] + 1) * self.width() / 2
        y = (1 - projected[1]) * self.height() / 2
        
        return (x, y)
    
    def project_point_orthographic(self, point, plane):
        point_4d = np.array([point[0], point[1], point[2], 1])
        transformed = self.transform_matrix @ point_4d
        
        if plane == "xy":
            x = (transformed[0] + 2) * self.width() / 4
            y = (2 - transformed[1]) * self.height() / 4
        elif plane == "xz":
            x = (transformed[0] + 2) * self.width() / 4 + self.width() / 2
            y = (2 - transformed[2]) * self.height() / 4
        elif plane == "yz":
            x = (transformed[1] + 2) * self.width() / 4
            y = (2 - transformed[2]) * self.height() / 4 + self.height() / 2
        
        return (x, y)
    
    def auto_rotate(self):
        self.rotation_y += 1
        if self.rotation_y >= 360:
            self.rotation_y = 0
        self.update_transform_matrix()
        self.update()
    
    def toggle_auto_rotation(self):
        self.auto_rotation = not self.auto_rotation
        if self.auto_rotation:
            self.timer.start(30)
        else:
            self.timer.stop()
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        painter.fillRect(self.rect(), QColor(20, 20, 30))
        
        if self.show_projections:
            self.draw_projections(painter)
        else:
            self.draw_main_view(painter)
    
    def draw_main_view(self, painter):
        pen = QPen(QColor(255, 255, 255), 1)
        painter.setPen(pen)
        
        painter.drawText(10, 20, "3D View")
        painter.drawText(10, 40, f"Rotation: X={self.rotation_x}° Y={self.rotation_y}° Z={self.rotation_z}°")
        painter.drawText(10, 60, f"Scale: {self.scale:.2f}")
        painter.drawText(10, 80, f"Translation: ({self.translation[0]:.1f}, {self.translation[1]:.1f}, {self.translation[2]:.1f})")
        
        center_x = self.width() / 2
        center_y = self.height() / 2
        
        pen = QPen(QColor(100, 100, 150), 1)
        painter.setPen(pen)
        painter.drawLine(center_x, 0, center_x, self.height())
        painter.drawLine(0, center_y, self.width(), center_y)
        
        pen = QPen(QColor(255, 255, 255), 2)
        painter.setPen(pen)
        
        for edge in self.object_3d.edges:
            v1 = self.object_3d.vertices[edge[0]]
            v2 = self.object_3d.vertices[edge[1]]
            
            p1 = self.project_point(v1)
            p2 = self.project_point(v2)
            
            painter.drawLine(int(p1[0]), int(p1[1]), int(p2[0]), int(p2[1]))
    
    def draw_projections(self, painter):
        painter.drawText(10, 20, "Orthographic Projections")
        
        pen = QPen(QColor(100, 100, 150), 1)
        painter.setPen(pen)
        
        painter.drawLine(self.width()//2, 0, self.width()//2, self.height())
        painter.drawLine(0, self.height()//2, self.width(), self.height()//2)
        
        pen = QPen(QColor(255, 100, 100), 2)
        painter.setPen(pen)
        
        for edge in self.object_3d.edges:
            v1 = self.object_3d.vertices[edge[0]]
            v2 = self.object_3d.vertices[edge[1]]
            
            p1_xy = self.project_point_orthographic(v1, "xy")
            p2_xy = self.project_point_orthographic(v2, "xy")
            painter.drawLine(int(p1_xy[0]), int(p1_xy[1]), int(p2_xy[0]), int(p2_xy[1]))
            
            p1_xz = self.project_point_orthographic(v1, "xz")
            p2_xz = self.project_point_orthographic(v2, "xz")
            painter.drawLine(int(p1_xz[0]), int(p1_xz[1]), int(p2_xz[0]), int(p2_xz[1]))
            
            p1_yz = self.project_point_orthographic(v1, "yz")
            p2_yz = self.project_point_orthographic(v2, "yz")
            painter.drawLine(int(p1_yz[0]), int(p1_yz[1]), int(p2_yz[0]), int(p2_yz[1]))
        
        font = QFont("Arial", 12, QFont.Bold)
        painter.setFont(font)
        pen = QPen(QColor(200, 200, 255), 1)
        painter.setPen(pen)
        
        painter.drawText(self.width()//4 - 30, 30, "XY Plane")
        painter.drawText(3*self.width()//4 - 30, 30, "XZ Plane")
        painter.drawText(self.width()//4 - 30, self.height()//2 + 30, "YZ Plane")

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Лабораторная работа 6 - 3D Графика")
        self.setGeometry(100, 100, 1200, 800)
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QHBoxLayout(central_widget)
        
        self.view_3d = ThreeDWidget()
        
        control_panel = QWidget()
        control_panel.setFixedWidth(300)
        control_layout = QVBoxLayout(control_panel)
        
        title_label = QLabel("3D Преобразования - Буква 'A'")
        title_label.setStyleSheet("font-size: 16px; font-weight: bold; color: white;")
        control_layout.addWidget(title_label)
        
        control_layout.addWidget(self.create_transform_group())
        control_layout.addWidget(self.create_projection_group())
        control_layout.addWidget(self.create_matrix_group())
        control_layout.addWidget(self.create_control_group())
        
        control_layout.addStretch()
        
        main_layout.addWidget(control_panel)
        main_layout.addWidget(self.view_3d)
    
    def create_transform_group(self):
        group = QGroupBox("Преобразования")
        layout = QGridLayout()
        
        self.rotation_x_slider = QSlider(Qt.Horizontal)
        self.rotation_x_slider.setRange(-180, 180)
        self.rotation_x_slider.setValue(0)
        self.rotation_x_slider.valueChanged.connect(self.update_rotation_x)
        
        self.rotation_y_slider = QSlider(Qt.Horizontal)
        self.rotation_y_slider.setRange(-180, 180)
        self.rotation_y_slider.setValue(0)
        self.rotation_y_slider.valueChanged.connect(self.update_rotation_y)
        
        self.rotation_z_slider = QSlider(Qt.Horizontal)
        self.rotation_z_slider.setRange(-180, 180)
        self.rotation_z_slider.setValue(0)
        self.rotation_z_slider.valueChanged.connect(self.update_rotation_z)
        
        self.scale_slider = QSlider(Qt.Horizontal)
        self.scale_slider.setRange(10, 300)
        self.scale_slider.setValue(100)
        self.scale_slider.valueChanged.connect(self.update_scale)
        
        self.translate_x_slider = QSlider(Qt.Horizontal)
        self.translate_x_slider.setRange(-200, 200)
        self.translate_x_slider.setValue(0)
        self.translate_x_slider.valueChanged.connect(self.update_translation_x)
        
        self.translate_y_slider = QSlider(Qt.Horizontal)
        self.translate_y_slider.setRange(-200, 200)
        self.translate_y_slider.setValue(0)
        self.translate_y_slider.valueChanged.connect(self.update_translation_y)
        
        self.translate_z_slider = QSlider(Qt.Horizontal)
        self.translate_z_slider.setRange(-200, 200)
        self.translate_z_slider.setValue(0)
        self.translate_z_slider.valueChanged.connect(self.update_translation_z)
        
        layout.addWidget(QLabel("Вращение X:"), 0, 0)
        layout.addWidget(self.rotation_x_slider, 0, 1)
        layout.addWidget(QLabel("Вращение Y:"), 1, 0)
        layout.addWidget(self.rotation_y_slider, 1, 1)
        layout.addWidget(QLabel("Вращение Z:"), 2, 0)
        layout.addWidget(self.rotation_z_slider, 2, 1)
        layout.addWidget(QLabel("Масштаб:"), 3, 0)
        layout.addWidget(self.scale_slider, 3, 1)
        layout.addWidget(QLabel("Перенос X:"), 4, 0)
        layout.addWidget(self.translate_x_slider, 4, 1)
        layout.addWidget(QLabel("Перенос Y:"), 5, 0)
        layout.addWidget(self.translate_y_slider, 5, 1)
        layout.addWidget(QLabel("Перенос Z:"), 6, 0)
        layout.addWidget(self.translate_z_slider, 6, 1)
        
        group.setLayout(layout)
        return group
    
    def create_projection_group(self):
        group = QGroupBox("Проекции")
        layout = QVBoxLayout()
        
        self.perspective_radio = QRadioButton("Перспективная проекция")
        self.orthographic_radio = QRadioButton("Ортографическая проекция")
        self.perspective_radio.setChecked(True)
        
        self.perspective_radio.toggled.connect(self.update_projection_type)
        
        self.projections_checkbox = QRadioButton("Показать 3 проекции")
        self.projections_checkbox.toggled.connect(self.toggle_projections)
        
        layout.addWidget(self.perspective_radio)
        layout.addWidget(self.orthographic_radio)
        layout.addWidget(self.projections_checkbox)
        
        group.setLayout(layout)
        return group
    
    def create_matrix_group(self):
        group = QGroupBox("Матрица преобразования")
        layout = QVBoxLayout()
        
        self.matrix_label = QLabel()
        self.matrix_label.setStyleSheet("font-family: monospace; color: #88ff88; background: #222; padding: 5px;")
        self.matrix_label.setWordWrap(True)
        self.update_matrix_display()
        
        layout.addWidget(self.matrix_label)
        group.setLayout(layout)
        return group
    
    def create_control_group(self):
        group = QGroupBox("Управление")
        layout = QVBoxLayout()
        
        self.reset_button = QPushButton("Сброс преобразований")
        self.reset_button.clicked.connect(self.reset_transforms)
        
        self.auto_rotation_button = QPushButton("Вкл/Выкл автоповорот")
        self.auto_rotation_button.clicked.connect(self.view_3d.toggle_auto_rotation)
        
        layout.addWidget(self.reset_button)
        layout.addWidget(self.auto_rotation_button)
        
        group.setLayout(layout)
        return group
    
    def update_rotation_x(self, value):
        self.view_3d.rotation_x = value
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_rotation_y(self, value):
        self.view_3d.rotation_y = value
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_rotation_z(self, value):
        self.view_3d.rotation_z = value
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_scale(self, value):
        self.view_3d.scale = value / 100.0
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_translation_x(self, value):
        self.view_3d.translation[0] = value / 50.0
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_translation_y(self, value):
        self.view_3d.translation[1] = value / 50.0
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_translation_z(self, value):
        self.view_3d.translation[2] = value / 50.0
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_projection_type(self):
        if self.perspective_radio.isChecked():
            self.view_3d.projection_type = "perspective"
        else:
            self.view_3d.projection_type = "orthographic"
        self.view_3d.update_projection_matrix()
        self.view_3d.update()
    
    def toggle_projections(self, checked):
        self.view_3d.show_projections = checked
        self.view_3d.update()
    
    def reset_transforms(self):
        self.view_3d.rotation_x = 0
        self.view_3d.rotation_y = 0
        self.view_3d.rotation_z = 0
        self.view_3d.scale = 1.0
        self.view_3d.translation = [0, 0, 0]
        
        self.rotation_x_slider.setValue(0)
        self.rotation_y_slider.setValue(0)
        self.rotation_z_slider.setValue(0)
        self.scale_slider.setValue(100)
        self.translate_x_slider.setValue(0)
        self.translate_y_slider.setValue(0)
        self.translate_z_slider.setValue(0)
        
        self.view_3d.update_transform_matrix()
        self.view_3d.update()
        self.update_matrix_display()
    
    def update_matrix_display(self):
        matrix = self.view_3d.transform_matrix
        text = ""
        for i in range(4):
            row = matrix[i]
            text += f"[{row[0]:7.3f} {row[1]:7.3f} {row[2]:7.3f} {row[3]:7.3f}]\n"
        self.matrix_label.setText(text)

def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()