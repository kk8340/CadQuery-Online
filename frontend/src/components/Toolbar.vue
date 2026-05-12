<template>
  <div :class="['h-full bg-slate-900/30 border-r border-slate-700 overflow-y-auto overflow-x-visible transition-all duration-300', visible ? 'w-72' : 'w-0 overflow-hidden']" style="overflow-x: visible;">
    <div class="p-3 space-y-2">
      <div
        v-for="section in sections"
        :key="section.id"
        :class="['tool-section', collapsed[section.id] ? 'collapsed' : '']"
        :data-section="section.id"
      >
        <div class="tool-section-header" @click="toggleSection(section.id)">
          <div class="tool-section-title">
            <span>{{ section.icon }}</span>
            <span>{{ section.name }}</span>
          </div>
          <svg class="tool-section-toggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <div class="tool-section-content">
          <div class="tool-grid pt-1">
            <button
              v-for="tool in section.tools"
              :key="tool.label"
              class="tool-btn"
              :data-code="tool.code"
              @click="$emit('insert-code', tool.code)"
            >
              <span>{{ tool.label }}</span>
              <div class="tooltip">
                <div class="tooltip-title">{{ tool.title }}</div>
                <div class="tooltip-desc">{{ tool.desc }}</div>
                <div class="tooltip-code">{{ tool.code }}</div>
                <div v-if="tool.param" class="tooltip-example">
                  <div class="tooltip-example-label">参数说明</div>
                  <div class="tooltip-code">{{ tool.param }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'

defineProps({
  visible: { type: Boolean, default: true }
})

defineEmits(['insert-code', 'toggle-tools'])

const collapsed = reactive({})

onMounted(() => {
  try {
    const saved = localStorage.getItem('cq_tool_sections_collapsed')
    if (saved) Object.assign(collapsed, JSON.parse(saved))
  } catch {}
})

function toggleSection(id) {
  collapsed[id] = !collapsed[id]
  try {
    localStorage.setItem('cq_tool_sections_collapsed', JSON.stringify(collapsed))
  } catch {}
}

const sections = [
  {
    id: 'shapes', icon: '📦', name: '基础形状',
    tools: [
      { label: 'Box', title: '长方体 (Box)', desc: '创建一个长方体，可以指定长、宽、高参数', code: 'cq.Workplane().box(20, 20, 10)', param: 'box(length, width, height)' },
      { label: 'Cylinder', title: '圆柱体 (Cylinder)', desc: '创建圆形草图后拉伸成圆柱体', code: 'cq.Workplane().circle(10).extrude(20)' },
      { label: 'Sphere', title: '球体 (Sphere)', desc: '创建一个完整的球体', code: 'cq.Workplane().sphere(10)' },
      { label: 'Polygon', title: '多边形棱柱', desc: '创建正多边形并拉伸成棱柱', code: 'cq.Workplane().polygon(6, 10).extrude(10)' },
      { label: 'Ellipse', title: '椭圆柱体', desc: '创建椭圆并拉伸成柱体', code: 'cq.Workplane().ellipse(20, 10).extrude(5)' },
      { label: 'Torus', title: '圆环 (Torus)', desc: '创建一个圆环体', code: 'cq.Workplane().torus(10, 3)' },
      { label: 'Wedge', title: '楔形体 (Wedge)', desc: '创建一个直角楔形块', code: 'cq.Workplane().wedge(10, 10, 10)' },
      { label: 'Cyl2', title: '圆柱体 (Direct)', desc: '直接创建圆柱体的快捷方式', code: 'cq.Workplane().cylinder(20, 10)' },
    ]
  },
  {
    id: 'boolean', icon: '🔀', name: '布尔操作',
    tools: [
      { label: 'union', title: '合并 (union)', desc: '将两个实体合并为一个', code: '.union(other)' },
      { label: 'cut', title: '减切 (cut)', desc: '从一个实体减去另一个实体', code: '.cut(other)' },
      { label: 'intersect', title: '交集 (intersect)', desc: '保留两个实体重叠的部分', code: '.intersect(other)' },
    ]
  },
  {
    id: 'edges', icon: '🔧', name: '边操作',
    tools: [
      { label: 'fillet', title: '圆角 (fillet)', desc: '在选定边上创建圆角', code: '.edges().fillet(2)' },
      { label: 'chamfer', title: '倒角 (chamfer)', desc: '在选定边上创建45度倒角', code: '.edges().chamfer(2)' },
      { label: 'shell', title: '抽壳 (shell)', desc: '将实体变为空心壳体', code: '.shell(2)' },
      { label: 'offset2D', title: '偏移 (offset2D)', desc: '将2D草图向内或向外偏移', code: '.offset2D(2)' },
      { label: 'thicken', title: '加厚 (thicken)', desc: '将面或壳加厚成实体', code: '.thicken(5)' },
    ]
  },
  {
    id: 'transform', icon: '🔄', name: '变换',
    tools: [
      { label: 'translate', title: '平移 (translate)', desc: '沿XYZ方向移动实体', code: '.translate((10, 5, 0))' },
      { label: 'rotate', title: '旋转 (rotate)', desc: '绕指定轴旋转实体', code: '.rotate((0,0,0), (0,0,1), 90)' },
      { label: 'scale', title: '缩放 (scale)', desc: '等比例缩放实体', code: '.scale(0.5)' },
      { label: 'mirror', title: '镜像 (mirror)', desc: '沿指定平面对称复制', code: ".mirror('YZ')" },
      { label: 'tag', title: '标记 (tag)', desc: '给当前对象添加标签以便引用', code: ".tag('my_feature')" },
    ]
  },
  {
    id: 'sketch', icon: '✏️', name: '草图',
    tools: [
      { label: 'moveTo', title: '移动到 (moveTo)', desc: '将当前点移动到指定坐标，不画线', code: '.moveTo(x, y)' },
      { label: 'lineTo', title: '画线到 (lineTo)', desc: '从当前点画直线到目标坐标', code: '.lineTo(x, y)' },
      { label: 'vLine', title: '垂直线 (vLine)', desc: '画一条垂直方向的线段', code: '.vLine(distance)' },
      { label: 'hLine', title: '水平线 (hLine)', desc: '画一条水平方向的线段', code: '.hLine(distance)' },
      { label: 'vLineTo', title: '垂直到 (vLineTo)', desc: '画垂直线到指定Y坐标', code: '.vLineTo(y)' },
      { label: 'hLineTo', title: '水平到 (hLineTo)', desc: '画水平线到指定X坐标', code: '.hLineTo(x)' },
      { label: 'rect', title: '矩形 (rect)', desc: '在当前位置创建矩形', code: '.rect(width, height)' },
      { label: 'circle', title: '圆 (circle)', desc: '在当前位置创建圆形', code: '.circle(radius)' },
      { label: 'ellipse', title: '椭圆 (ellipse)', desc: '创建椭圆草图', code: '.ellipse(x_radius, y_radius)' },
      { label: 'spline', title: '样条曲线 (spline)', desc: '通过一系列点创建平滑曲线', code: '.spline([(0,0), (1,2), (2,1)])' },
      { label: 'arc', title: '圆弧 (arc)', desc: '创建圆弧连接两个点', code: '.arc(start, end, radius)' },
      { label: 'close', title: '闭合 (close)', desc: '将当前路径闭合，连接首尾', code: '.close()' },
      { label: 'center', title: '中心点 (center)', desc: '移动工作中心点', code: '.center(x, y)' },
      { label: 'pushPoints', title: '推点 (pushPoints)', desc: '添加多个工作点用于后续操作', code: '.pushPoints([(10,0), (-10,0)])' },
    ]
  },
  {
    id: 'holes', icon: '🎯', name: '孔与槽',
    tools: [
      { label: 'hole', title: '孔 (hole)', desc: '在当前位置打通孔', code: '.hole(5)' },
      { label: 'blindHole', title: '盲孔', desc: '打指定深度的盲孔', code: '.hole(5, depth=10)' },
      { label: 'cboreHole', title: '沉头孔', desc: '创建用于螺栓头的沉头孔', code: '.cboreHole(3, 6, 3)' },
      { label: 'csinkHole', title: '倒角孔', desc: '创建用于沉头螺钉的倒角孔', code: '.counterSinkHole(3, 6, 82)' },
      { label: 'boss', title: '凸台 (boss)', desc: '创建圆柱形凸台', code: '.boss(10, 5)' },
      { label: 'slot', title: '槽 (slot)', desc: '在工作平面上创建槽', code: '.slot2D(20, 5)' },
    ]
  },
  {
    id: 'pattern', icon: '📐', name: '模式',
    tools: [
      { label: 'rectArray', title: '矩形阵列', desc: '创建矩形网格排列的多个副本', code: '.rectArray(20, 20, 3, 3)' },
      { label: 'polarArray', title: '环形阵列', desc: '创建圆周排列的多个副本', code: '.polarArray(30, 6)' },
      { label: 'polygonArray', title: '多边形阵列', desc: '沿多边形顶点创建阵列', code: '.polygonArray(6, 40)' },
      { label: 'rarray', title: '自定义向量阵列', desc: '使用自定义向量的阵列', code: '.rarray((20,0), (0,20), 3, 3)' },
      { label: 'extrude', title: '拉伸 (extrude)', desc: '将2D草图沿法线方向拉伸成3D实体', code: '.extrude(20)' },
      { label: 'revolve', title: '旋转 (revolve)', desc: '将草图绕轴旋转生成实体', code: '.revolve(360)' },
      { label: 'sweep', title: '扫掠 (sweep)', desc: '将截面沿路径扫掠生成实体', code: '.sweep(path_object)' },
      { label: 'loft', title: '放样 (loft)', desc: '通过多个截面轮廓生成平滑过渡的实体', code: '.loft()' },
    ]
  },
  {
    id: 'selection', icon: '🎯', name: '选择器',
    tools: [
      { label: '>Z (top)', title: '顶面选择', desc: '选择Z轴正方向最上方的面', code: ".faces('>Z')" },
      { label: '<Z (bottom)', title: '底面选择', desc: '选择Z轴负方向最下方的面', code: ".faces('<Z')" },
      { label: '|Z (side)', title: 'Z方向垂直面', desc: '选择所有垂直于Z轴的面', code: ".faces('|Z')" },
      { label: '+Z', title: '所有Z方向面', desc: '选择所有在Z方向的面', code: ".faces('+Z')" },
      { label: 'edges', title: '所有边', desc: '选择实体的所有边', code: '.edges()' },
      { label: 'vertices', title: '所有顶点', desc: '选择实体的所有顶点', code: '.vertices()' },
      { label: 'solids', title: '所有实体', desc: '选择所有实体', code: '.solids()' },
      { label: 'workplane', title: '工作平面', desc: '在选中面上创建新的工作平面', code: ".faces('>Z').workplane()" },
      { label: 'wires', title: '线框', desc: '选择所有闭合的线框', code: '.wires()' },
      { label: 'first', title: '第一个', desc: '只选择列表中的第一个元素', code: '.faces().first()' },
      { label: 'last', title: '最后一个', desc: '只选择列表中的最后一个元素', code: '.faces().last()' },
      { label: 'item', title: '指定索引', desc: '选择指定索引的元素', code: '.faces().item(0)' },
    ]
  },
  {
    id: 'templates', icon: '📝', name: '模板代码',
    tools: [
      { label: 'Basic Box', title: '基础长方体模板', desc: '快速创建一个简单的长方体', code: "result = cq.Workplane('XY').box(20, 20, 10)" },
      { label: 'Hole Block', title: '带孔方块模板', desc: '圆柱体中心带通孔', code: "result = cq.Workplane('XY').circle(10).extrude(20).faces('>Z').workplane().hole(5)" },
      { label: 'Polyline', title: '多边形拉伸模板', desc: '使用多段线创建自定义形状', code: "result = cq.Workplane('front').polyline([(0,0), (10,0), (10,10), (0,5)]).close().extrude(5)" },
      { label: 'Plate Holes', title: '多孔板模板', desc: '在矩形四个角打孔的安装板', code: "s = cq.Workplane('XY'); s.circle(50).rect(20, 20, forConstruction=True).vertices().hole(10); result = s.extrude(10)" },
    ]
  },
]
</script>
