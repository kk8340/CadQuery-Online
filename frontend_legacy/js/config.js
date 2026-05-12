export const API_BASE = '/api';

export const CACHE_KEYS = {
    EXAMPLES: 'cq_examples_cache',
    MODELS: 'cq_models_cache'
};

export const CACHE_TTL = 5 * 60 * 1000;

export const DEFAULT_CODE = `result = cq.Workplane("XY").box(20, 20, 10)`;

export const TEMPLATES = [
    {
        id: 'box',
        name: '长方体',
        description: '创建一个简单的长方体',
        icon: '📦',
        code: `result = cq.Workplane("XY").box(20, 20, 10)`
    },
    {
        id: 'cylinder',
        name: '圆柱体',
        description: '创建一个圆柱体',
        icon: '🔵',
        code: `result = cq.Workplane("XY").circle(10).extrude(20)`
    },
    {
        id: 'cone',
        name: '圆锥体',
        description: '创建一个圆锥体',
        icon: '🔺',
        code: `result = cq.Workplane("XY").polygon(3, 20).extrude(30)`
    },
    {
        id: 'hole',
        name: '带孔的方块',
        description: '在方块中心创建一个孔',
        icon: '🕳️',
        code: `result = (
    cq.Workplane("XY")
    .box(30, 30, 15)
    .faces(">Z")
    .workplane()
    .hole(10)
)`
    },
    {
        id: 'fillet',
        name: '圆角方块',
        description: '创建带圆角的方图',
        icon: '⬜',
        code: `result = (
    cq.Workplane("XY")
    .box(30, 30, 15)
    .edges()
    .fillet(3)
)`
    },
    {
        id: 'extrude',
        name: '复杂拉伸',
        description: '从草图创建复杂形状',
        icon: '🎨',
        code: `result = (
    cq.Workplane("XY")
    .hLine(20)
    .vLine(10)
    .hLine(-10)
    .vLine(10)
    .hLine(-10)
    .close()
    .extrude(15)
)`
    }
];
