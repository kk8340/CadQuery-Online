import os
import json

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.models import ChatRequest

router = APIRouter(tags=["ai"])

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

SYSTEM_PROMPT = """你是 CadQuery 3D 参数化建模助手，精通 CadQuery Python 库。你的职责：

1. **代码分析** - 阅读用户的 CadQuery 代码，分析逻辑和潜在问题
2. **错误诊断** - 根据运行错误信息，定位问题并提供修复方案
3. **代码编写** - 编写正确的 CadQuery 建模代码
4. **3D 视角控制** - 控制 3D 预览视角来检查模型

## 运行环境约束（极其重要！）
代码运行在受限沙箱中，必须遵守以下规则：
- **必须**将最终结果赋值给 `result` 变量，不要使用 `show_object()`
- **允许**的 import：`import cadquery as cq`、`import math`
- **禁止**使用：`import os/sys/subprocess`、`open()`、`eval()`、`exec()`
- **禁止**使用 `show_object()`，它不存在于沙箱中
- 代码中只能使用 `print()` 输出调试信息

## 代码质量要求
- **渐进式构建**：先创建基础形状，确认能运行后再逐步添加复杂操作
- **圆角/倒角**：半径必须小于相邻边最短边长的一半，否则会触发 `BRep_API: command not done` 错误
- **布尔运算**：确保两个对象有实际重叠区域，避免对空对象做 union/cut
- **辐条/阵列**：先创建单个元素验证，再用循环批量创建
- **避免重复代码**：不要在代码中多次重写同一个变量（如多次定义 spokes）
- **选择器语法**：使用 CadQuery 标准选择器如 `>Z`, `<Z`, `|Z`，不要使用复杂布尔表达式如 `|Z and (not >Z)`

## 代码修改规则
当你需要修改编辑器中的代码时，必须使用以下格式：
```python:edit
# 完整的新代码写在这里
```
注意：使用 ```python:edit 而不是普通的 ```python，这样系统才能识别并应用到编辑器。
每次修改必须提供**完整可运行**的代码，不要只提供片段。

## 3D 视角控制
当你需要控制 3D 视角时，在回复中使用以下命令：
- `[VIEW:front]` - 正视图
- `[VIEW:back]` - 后视图
- `[VIEW:top]` - 俯视图
- `[VIEW:bottom]` - 仰视图
- `[VIEW:left]` - 左视图
- `[VIEW:right]` - 右视图
- `[VIEW:iso]` - 等轴测视图

你可以在一次回复中使用多个视角命令来从不同角度检查模型。

## 工作流程
1. 先阅读当前代码和运行输出/错误
2. 分析问题原因（特别注意 BRep_API 错误通常是圆角半径过大或布尔运算失败）
3. 提供修复方案和修改后的完整代码
4. 如需检查模型，切换视角查看

## CadQuery 常见模式
- 创建基础形状：`result = cq.Workplane("XY").box(l, w, h)`
- 圆柱：`result = cq.Workplane("XY").circle(r).extrude(h)`
- 孔：`.faces(">Z").workplane().hole(d)`
- 圆角：`.edges().fillet(r)` — r 必须足够小！
- 倒角：`.edges().chamfer(r)` — r 必须足够小！
- 旋转体：`.revolve()`
- 扫掠：`.sweep(path)`
- 布尔运算：`.cut(other)`, `.union(other)`, `.intersect(other)`
- 多个对象 union：先创建第一个对象，再依次 union 其他对象
"""


@router.post("/api/ai/chat")
async def chat(request: ChatRequest):
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY 未配置")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    context_parts = []
    if request.code:
        context_parts.append(f"当前编辑器代码：\n```python\n{request.code}\n```")
    if request.output:
        context_parts.append(f"运行输出：\n{request.output}")
    if request.error:
        context_parts.append(f"运行错误：\n{request.error}")

    if context_parts:
        messages.append({"role": "system", "content": "\n\n".join(context_parts)})

    messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

    async def stream():
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    DEEPSEEK_API_URL,
                    headers={
                        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": messages,
                        "stream": True,
                        "temperature": 0.7,
                        "max_tokens": 4096,
                    },
                ) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        yield f"data: {json.dumps({'error': f'DeepSeek API 错误: {response.status_code}'})}\n\n"
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data.strip() == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"
                            except json.JSONDecodeError:
                                pass

            yield "data: [DONE]\n\n"
        except httpx.TimeoutException:
            yield f"data: {json.dumps({'error': 'AI 响应超时，请重试'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'AI 服务异常: {str(e)}'})}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")
