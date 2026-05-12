# CadQuery 编程指南 - AI 参考手册

## 📖 目录
1. 简介与环境设置
2. 核心概念
3. 工作平面与坐标系
4. 基本形状创建
5. 草图绘制
6. 3D操作
7. 选择器系统
8. 布尔运算
9. 变换操作
10. 阵列与重复
11. 参数化设计
12. 高级技巧

---

## 1. 简介与环境设置

### 1.1 什么是 CadQuery
CadQuery 是一个基于 Python 的参数化 3D 建模库，允许您使用代码创建精确的 CAD 模型。

### 1.2 基本导入
```python
import cadquery as cq
```

### 1.3 输出要求
所有代码必须定义 `result` 变量：
```python
result = cq.Workplane("XY").box(20, 20, 10)
```

---

## 2. 核心概念

### 2.1 链式调用
CadQuery 使用流畅的链式 API：
```python
result = (
    cq.Workplane("XY")
    .box(100, 50, 20)
    .faces(">Z")
    .workplane()
    .hole(15)
)
```

### 2.2 工作平面 (Workplane)
工作平面是建模的基础：
- `"XY"` - XY平面，Z轴向上
- `"XZ"` - XZ平面，Y轴向上
- `"YZ"` - YZ平面，X轴向上
- `"front"` - 前视图
- `"back"` - 后视图
- `"left"` - 左视图
- `"right"` - 右视图
- `"top"` - 俯视图
- `"bottom"` - 仰视图

### 2.3 对象状态
每次操作都会返回新的状态对象，保持不可变性。

---

## 3. 工作平面与坐标系

### 3.1 创建工作平面
```python
# 基础工作平面
wp = cq.Workplane("XY")

# 在面上创建工作平面
result = (
    cq.Workplane("XY")
    .box(100, 100, 20)
    .faces(">Z")
    .workplane()  # 在顶面创建工作平面
)

# 带偏移的工作平面
result = (
    cq.Workplane("XY")
    .box(100, 100, 20)
    .faces(">Z")
    .workplane(offset=5)  # 向上偏移5mm
)
```

### 3.2 移动工作中心
```python
result = (
    cq.Workplane("XY")
    .center(20, 30)  # 移动到(20, 30)
    .circle(10)
    .extrude(5)
)
```

---

## 4. 基本形状创建

### 4.1 长方体
```python
result = cq.Workplane("XY").box(length, width, height)
result = cq.Workplane("XY").box(100, 50, 30)
```

### 4.2 圆柱体
```python
# 方式1：草图+拉伸
result = cq.Workplane("XY").circle(25).extrude(50)

# 方式2：直接创建
result = cq.Workplane("XY").cylinder(height=50, radius=25)
```

### 4.3 球体
```python
result = cq.Workplane().sphere(30)
```

### 4.4 圆环
```python
result = cq.Workplane().torus(outer_radius=50, inner_radius=10)
```

### 4.5 楔形体
```python
result = cq.Workplane().wedge(xlength=50, ylength=30, zlength=20)
```

### 4.6 多边形棱柱
```python
# 六边形棱柱
result = cq.Workplane("XY").polygon(6, 20).extrude(30)
```

---

## 5. 草图绘制

### 5.1 基本草图元素
```python
result = (
    cq.Workplane("XY")
    .rect(100, 60)      # 矩形
    .circle(30)         # 圆
    .ellipse(40, 20)    # 椭圆
    .extrude(10)
)
```

### 5.2 路径绘制
```python
result = (
    cq.Workplane("XY")
    .moveTo(0, 0)       # 移动到起点
    .lineTo(50, 0)      # 画线到(50, 0)
    .vLine(30)          # 垂直向上30mm
    .hLine(-20)         # 水平向左20mm
    .lineTo(0, 0)       # 画线回原点
    .close()            # 闭合路径
    .extrude(10)
)
```

### 5.3 圆弧与样条
```python
# 圆弧
result = (
    cq.Workplane("XY")
    .moveTo(0, 0)
    .threePointArc((10, 10), (0, 20))  # 通过三点的圆弧
    .close()
    .extrude(5)
)

# 样条曲线
result = (
    cq.Workplane("XY")
    .spline([(0, 0), (20, 10), (40, 5), (60, 15)])
    .close()
    .extrude(5)
)
```

### 5.4 构造几何
```python
# 构造几何用于辅助定位，不参与建模
result = (
    cq.Workplane("XY")
    .circle(50)
    .rect(80, 80, forConstruction=True)  # 构造矩形
    .vertices()                          # 选择顶点
    .hole(8)                             # 在顶点打孔
    .extrude(10)
)
```

---

## 6. 3D操作

### 6.1 拉伸 (Extrude)
```python
# 基础拉伸
result = cq.Workplane("XY").circle(20).extrude(30)

# 双向拉伸
result = cq.Workplane("XY").circle(20).extrude(15, both=True)

# 拉伸到对象
result = cq.Workplane("XY").circle(20).extrudeUntil(other_object)
```

### 6.2 旋转 (Revolve)
```python
# 360度旋转
result = (
    cq.Workplane("XY")
    .moveTo(10, 0)
    .lineTo(30, 0)
    .vLine(20)
    .lineTo(10, 20)
    .close()
    .revolve(360)
)

# 指定旋转轴
result = sketch.revolve(180, (0, 0, 0), (0, 1, 0))
```

### 6.3 扫掠 (Sweep)
```python
# 创建截面和路径
profile = cq.Workplane("XY").circle(5)
path = cq.Workplane("XZ").spline([(0, 0), (50, 20), (100, 0)])

# 执行扫掠
result = profile.sweep(path)
```

### 6.4 放样 (Loft)
```python
# 创建多个截面
wp1 = cq.Workplane("XY").circle(30)
wp2 = cq.Workplane("XY").workplane(offset=40).circle(20)
wp3 = cq.Workplane("XY").workplane(offset=60).circle(10)

# 执行放样
result = wp1.loft(wp2, wp3)
```

### 6.5 抽壳 (Shell)
```python
result = (
    cq.Workplane("XY")
    .box(100, 80, 60)
    .shell(2)  # 2mm壁厚
)

# 指定移除的面
result = (
    cq.Workplane("XY")
    .box(100, 80, 60)
    .faces(">Z")
    .shell(2)  # 移除顶面
)
```

### 6.6 圆角与倒角
```python
# 圆角所有边
result = cq.Workplane("XY").box(50, 50, 50).edges().fillet(5)

# 圆角特定边
result = (
    cq.Workplane("XY")
    .box(50, 50, 50)
    .edges("|Z")  # 垂直边
    .fillet(5)
)

# 倒角
result = cq.Workplane("XY").box(50, 50, 50).edges().chamfer(5)
```

---

## 7. 选择器系统

### 7.1 面选择器
```python
.faces(">Z")    # Z轴正方向的面（顶面）
.faces("<Z")    # Z轴负方向的面（底面）
.faces("|Z")    # 垂直于Z轴的面
.faces("+Z")    # 所有Z方向的面
.faces(">X")    # X轴正方向的面
.faces("<X")    # X轴负方向的面
.faces(">Y")    # Y轴正方向的面
.faces("<Y")    # Y轴负方向的面
```

### 7.2 边选择器
```python
.edges()        # 所有边
.edges(">Z")    # Z方向的边
.edges("|Z")    # 垂直于Z轴的边
.edges("%Line") # 直线边
.edges("%Circle") # 圆弧边
```

### 7.3 顶点选择器
```python
.vertices()        # 所有顶点
.vertices(">XY")   # 特定区域的顶点
```

### 7.4 过滤选择
```python
.first()      # 第一个
.last()       # 最后一个
.item(0)      # 指定索引
.nth(2)       # 第n个
.size()       # 返回数量
```

---

## 8. 布尔运算

### 8.1 合并 (Union)
```python
box1 = cq.Workplane("XY").box(50, 50, 20)
box2 = cq.Workplane("XY").box(30, 30, 40).translate((10, 10, 10))

result = box1.union(box2)
```

### 8.2 减切 (Cut)
```python
base = cq.Workplane("XY").box(100, 100, 20)
cutter = cq.Workplane("XY").cylinder(30, 15).translate((50, 50, 0))

result = base.cut(cutter)
```

### 8.3 交集 (Intersect)
```python
box = cq.Workplane("XY").box(50, 50, 50)
sphere = cq.Workplane("XY").sphere(30).translate((25, 25, 25))

result = box.intersect(sphere)
```

### 8.4 打孔
```python
# 通孔
result = cq.Workplane("XY").box(50, 50, 20).faces(">Z").workplane().hole(10)

# 盲孔
result = cq.Workplane("XY").box(50, 50, 20).faces(">Z").workplane().hole(10, depth=15)

# 沉头孔
result = (
    cq.Workplane("XY")
    .box(50, 50, 20)
    .faces(">Z")
    .workplane()
    .cboreHole(6, 12, 5)  # 孔径6，沉头直径12，沉头深度5
)

# 倒角孔
result = (
    cq.Workplane("XY")
    .box(50, 50, 20)
    .faces(">Z")
    .workplane()
    .counterSinkHole(6, 12, 82)  # 孔径6，倒角直径12，角度82度
)
```

---

## 9. 变换操作

### 9.1 平移
```python
result = cq.Workplane("XY").box(20, 20, 20).translate((50, 30, 10))
```

### 9.2 旋转
```python
# 绕指定轴旋转
result = cq.Workplane("XY").box(20, 20, 20).rotate((0, 0, 0), (0, 0, 1), 45)
```

### 9.3 缩放
```python
result = cq.Workplane("XY").box(20, 20, 20).scale(2.0)  # 放大2倍
```

### 9.4 镜像
```python
result = cq.Workplane("XY").box(20, 20, 20).mirror("YZ")  # 沿YZ平面镜像
```

---

## 10. 阵列与重复

### 10.1 矩形阵列
```python
result = (
    cq.Workplane("XY")
    .box(100, 100, 10)
    .faces(">Z")
    .workplane()
    .rectArray(20, 20, 4, 4)  # X间距, Y间距, X数量, Y数量
    .hole(5)
)
```

### 10.2 环形阵列
```python
result = (
    cq.Workplane("XY")
    .circle(50)
    .extrude(10)
    .faces(">Z")
    .workplane()
    .polarArray(30, 6)  # 半径, 数量
    .hole(8)
)

# 带起始角度
result = (
    cq.Workplane("XY")
    .circle(50)
    .extrude(10)
    .faces(">Z")
    .workplane()
    .polarArray(30, 6, startAngle=45)
    .hole(8)
)
```

### 10.3 多边形阵列
```python
result = (
    cq.Workplane("XY")
    .circle(50)
    .extrude(10)
    .faces(">Z")
    .workplane()
    .polygonArray(6, 40)  # 边数, 直径
    .hole(8)
)
```

### 10.4 自定义向量阵列
```python
result = (
    cq.Workplane("XY")
    .box(100, 100, 10)
    .faces(">Z")
    .workplane()
    .rarray((20, 0), (0, 30), 4, 3)  # X向量, Y向量, X数量, Y数量
    .hole(5)
)
```

---

## 11. 参数化设计

### 11.1 使用字典管理参数
```python
params = {
    "base_length": 100.0,
    "base_width": 60.0,
    "base_height": 10.0,
    "hole_diameter": 12.0,
    "hole_spacing": 40.0,
    "fillet_radius": 5.0
}

result = (
    cq.Workplane("XY")
    .box(params["base_length"], params["base_width"], params["base_height"])
    .edges()
    .fillet(params["fillet_radius"])
    .faces(">Z")
    .workplane()
    .rect(params["base_length"] - 20, params["base_width"] - 20, forConstruction=True)
    .vertices()
    .hole(params["hole_diameter"])
)
```

### 11.2 使用类封装
```python
class Bracket:
    def __init__(self, length=100, width=50, height=30):
        self.length = length
        self.width = width
        self.height = height
    
    def build(self):
        return (
            cq.Workplane("XY")
            .box(self.length, self.width, self.height)
            .faces(">Z")
            .workplane()
            .hole(10)
        )

bracket = Bracket(length=150, width=60, height=25)
result = bracket.build()
```

---

## 12. 高级技巧

### 12.1 标签系统
```python
result = (
    cq.Workplane("XY")
    .box(100, 50, 20)
    .tag("base")
    .faces(">Z")
    .workplane()
    .circle(30)
    .cutThruAll()
    .tag("hole")
)
```

### 12.2 多实体管理
```python
# 创建多个实体
box1 = cq.Workplane("XY").box(50, 50, 20)
box2 = cq.Workplane("XY").box(30, 30, 30).translate((60, 0, 0))

# 组合
result = box1.add(box2)
```

### 12.3 颜色与材质
```python
# 在查看器中显示颜色
show_object(result, options={"color": (255, 0, 0)})
```

### 12.4 导出
```python
# 导出STL
cq.exporters.export(result, "model.stl", exportType="STL")

# 导出STEP
cq.exporters.export(result, "model.step", exportType="STEP")

# 导出SVG
cq.exporters.export(result, "model.svg", exportType="SVG")
```

---

## 📚 常用模式总结

| 操作类型 | 常用方法 |
|---------|---------|
| 基础形状 | `box()`, `circle()`, `sphere()`, `torus()` |
| 草图 | `rect()`, `moveTo()`, `lineTo()`, `spline()` |
| 3D操作 | `extrude()`, `revolve()`, `sweep()`, `loft()` |
| 选择器 | `faces()`, `edges()`, `vertices()`, `workplane()` |
| 布尔运算 | `union()`, `cut()`, `intersect()`, `hole()` |
| 变换 | `translate()`, `rotate()`, `scale()`, `mirror()` |
| 阵列 | `rectArray()`, `polarArray()`, `polygonArray()` |

---

**掌握这些知识，您就可以创建复杂的参数化模型了！** 🎉