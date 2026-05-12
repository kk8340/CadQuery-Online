import os
import re
import json
from pathlib import Path

EXAMPLES_DIR = Path(__file__).parent / "CadQueryExamples"
OUTPUT_FILE = Path(__file__).parent / "examples_templates.json"

# 示例分类
EXAMPLE_CATEGORIES = {
    "基础形状": ["Ex001", "Ex004"],
    "孔与孔位": ["Ex002", "Ex003", "Ex019"],
    "草图": ["Ex005", "Ex006", "Ex007", "Ex008", "Ex009", "Ex010"],
    "工作平面": ["Ex012", "Ex013", "Ex014", "Ex015", "Ex016"],
    "高级操作": ["Ex011", "Ex017", "Ex018", "Ex020", "Ex021"],
    "高级建模": ["Ex022", "Ex023", "Ex024", "Ex025", "Ex026"],
    "实用示例": ["Ex100", "Ex101"]
}

# 图标映射
ICONS = {
    "基础形状": "📦",
    "孔与孔位": "🕳️",
    "草图": "✏️",
    "工作平面": "📐",
    "高级操作": "🔧",
    "高级建模": "🎯",
    "实用示例": "🛠️"
}

def clean_example_code(code):
    """清理示例代码，适配我们的系统"""
    lines = code.split('\n')
    result = []
    has_result = False
    
    for line in lines:
        # 去掉 show_object 调用
        if 'show_object' in line:
            continue
        if 'from Helpers import' in line:
            continue
        if 'show(' in line and not line.strip().startswith('#'):
            continue
        
        # 检查是否有 result 变量赋值
        if line.strip().startswith('result ='):
            has_result = True
        
        result.append(line)
    
    final_code = '\n'.join(result).strip()
    
    # 如果没有 result 变量，尝试找到最后一个几何对象并赋值给 result
    if not has_result:
        lines = final_code.split('\n')
        last_geo_line = None
        
        for i, line in enumerate(reversed(lines)):
            if 'cq.Workplane' in line or line.strip().startswith('#') == False:
                if '=' in line and not line.strip().startswith('#'):
                    last_geo_line = i
                    break
        
        if last_geo_line is not None:
            # 找到最后一个变量赋值，替换为 result
            pass
    
    return final_code

def parse_example(filename):
    """解析单个示例文件"""
    filepath = EXAMPLES_DIR / filename
    
    if not filename.endswith('.py'):
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 从文件名提取信息
    match = re.match(r'Ex(\d+)_(.+)\.py', filename)
    if match:
        number = int(match.group(1))
        name = match.group(2).replace('_', ' ')
    else:
        number = 999
        name = filename.replace('.py', '').replace('_', ' ')
    
    # 找到分类
    category = "其他"
    for cat, prefixes in EXAMPLE_CATEGORIES.items():
        for prefix in prefixes:
            if filename.startswith(prefix):
                category = cat
                break
    
    # 清理代码
    clean_code = clean_example_code(content)
    
    return {
        "id": f"example_{number:03d}",
        "name": name,
        "filename": filename,
        "number": number,
        "category": category,
        "icon": ICONS.get(category, "📄"),
        "code": clean_code
    }

def main():
    print("🔍 扫描 CadQuery 示例文件...")
    
    examples = []
    
    # 读取所有示例文件
    for filename in sorted(os.listdir(EXAMPLES_DIR)):
        if filename.endswith('.py'):
            example = parse_example(filename)
            if example:
                examples.append(example)
                print(f"  ✅ {filename}")
    
    print(f"\n📊 共找到 {len(examples)} 个示例")
    
    # 按分类组织
    categories = {}
    for example in examples:
        cat = example["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(example)
    
    print(f"\n📁 分类统计:")
    for cat, items in sorted(categories.items()):
        print(f"  {ICONS.get(cat, '📄')} {cat}: {len(items)} 个")
    
    # 保存结果
    output = {
        "examples": examples,
        "categories": list(categories.keys())
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 保存到: {OUTPUT_FILE}")
    
    # 生成 JavaScript 格式，方便直接复制到 app.js
    print(f"\n📋 JavaScript 格式示例:")
    for cat in sorted(categories.keys()):
        print(f"\n// {ICONS.get(cat, '📄')} {cat}")
        for ex in categories[cat]:
            code_str = repr(ex["code"])
            print(f"""    {{
        id: '{ex['id']}',
        name: '{ex['name']}',
        category: '{ex['category']}',
        icon: '{ex['icon']}',
        code: {code_str}
    }},""")
    
    print("\n✅ 转换完成！")

if __name__ == "__main__":
    main()
