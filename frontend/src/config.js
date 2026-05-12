export const API_BASE = '/api'
export const CACHE_TTL = 5 * 60 * 1000
export const CACHE_KEYS = { EXAMPLES: 'cq_examples_cache', MODELS: 'cq_models_cache' }
export const DEFAULT_CODE = `result = cq.Workplane("XY").box(20, 20, 10)`
export const TEMPLATES = [
  { id: 'box', name: '长方体', description: '创建一个简单的长方体', icon: '📦', code: 'result = cq.Workplane("XY").box(20, 20, 10)' },
  { id: 'cylinder', name: '圆柱体', description: '创建一个圆柱体', icon: '🔵', code: 'result = cq.Workplane("XY").circle(10).extrude(20)' },
  { id: 'cone', name: '圆锥体', description: '创建一个圆锥体', icon: '🔺', code: 'result = cq.Workplane("XY").polygon(3, 20).extrude(30)' },
  { id: 'hole', name: '带孔的方块', description: '在方块中心创建一个孔', icon: '🕳️', code: 'result = (\n    cq.Workplane("XY")\n    .box(30, 30, 15)\n    .faces(">Z")\n    .workplane()\n    .hole(10)\n)' },
  { id: 'fillet', name: '圆角方块', description: '创建带圆角的方块', icon: '⬜', code: 'result = (\n    cq.Workplane("XY")\n    .box(30, 30, 15)\n    .edges()\n    .fillet(3)\n)' },
  { id: 'extrude', name: '复杂拉伸', description: '从草图创建复杂形状', icon: '🎨', code: 'result = (\n    cq.Workplane("XY")\n    .hLine(20)\n    .vLine(10)\n    .hLine(-10)\n    .vLine(10)\n    .hLine(-10)\n    .close()\n    .extrude(15)\n)' },
]
