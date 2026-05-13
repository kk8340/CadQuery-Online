import os
import base64
import tempfile
import math
import io
import contextlib
import traceback

from fastapi import APIRouter

from backend.models import ExecuteRequest, ExecuteResponse, ExportRequest, ExportResponse
from backend.safety import validate_code_safety

router = APIRouter(tags=["execute"])

try:
    import cadquery as cq
except ImportError:
    print("警告: CadQuery 未安装，部分功能将不可用")
    cq = None

ALLOWED_IMPORT_MODULES = {'math', 'cadquery'}

OCC_ERROR_HINTS = {
    'BRep_API: command not done': '几何操作失败，常见原因：圆角/倒角半径过大、布尔运算对象不兼容、草图自相交。建议减小圆角半径或检查几何体是否有效',
    'Standard_ConstructionError': '构造错误，几何体创建失败，请检查参数是否合理',
    'TopoDS_Shape': '拓扑形状错误，请检查几何操作参数',
    'StdFail_NotDone': '操作未完成，几何计算失败，请检查输入参数',
}


def _safe_import(name, *args, **kwargs):
    if name not in ALLOWED_IMPORT_MODULES:
        raise ImportError(f"禁止导入模块: {name}")
    return __import__(name, *args, **kwargs)


SAFE_BUILTINS = {
    'abs': abs, 'all': all, 'any': any, 'bin': bin, 'bool': bool,
    'chr': chr, 'complex': complex, 'dict': dict, 'divmod': divmod,
    'enumerate': enumerate, 'filter': filter, 'float': float,
    'format': format, 'frozenset': frozenset, 'hash': hash,
    'hex': hex, 'id': id, 'int': int, 'isinstance': isinstance,
    'len': len, 'list': list, 'map': map, 'max': max, 'min': min,
    'oct': oct, 'ord': ord, 'pow': pow, 'print': print,
    'range': range, 'repr': repr, 'reversed': reversed,
    'round': round, 'set': set, 'slice': slice, 'sorted': sorted,
    'str': str, 'sum': sum, 'tuple': tuple, 'type': type,
    'zip': zip, 'True': True, 'False': False, 'None': None,
    '__import__': _safe_import,
}


def _format_error(error):
    error_str = str(error)
    for key, hint in OCC_ERROR_HINTS.items():
        if key in error_str:
            return f"{error_str}\n💡 {hint}"
    tb = traceback.format_exc()
    for line in tb.split('\n'):
        if 'File "<string>"' in line or line.strip().startswith('Error') or line.strip().startswith('Traceback'):
            continue
        if line.strip() and not line.strip().startswith('^'):
            error_str += f'\n  {line.strip()}'
    return error_str


def execute_and_extract_result(code: str):
    if cq is None:
        return None, "CadQuery 引擎未安装，请检查后端依赖", ""

    is_safe, error_msg = validate_code_safety(code)
    if not is_safe:
        return None, error_msg, ""

    stdout_capture = io.StringIO()
    try:
        namespace = {
            '__builtins__': SAFE_BUILTINS,
            'cq': cq,
            'cadquery': cq,
        }

        with contextlib.redirect_stdout(stdout_capture):
            exec(code, namespace)

        result_obj = None
        if "result" in namespace:
            result_obj = namespace["result"]
        elif "show_object" in namespace:
            result_obj = namespace["show_object"]
        else:
            for key, value in namespace.items():
                if hasattr(value, 'val') or hasattr(value, 'faces'):
                    result_obj = value
                    break

        if result_obj is None:
            return None, "未找到可显示的模型，请确保代码定义了 'result' 变量", stdout_capture.getvalue()

        return result_obj, None, stdout_capture.getvalue()

    except Exception as e:
        return None, _format_error(e), stdout_capture.getvalue()


@router.post("/api/execute", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest):
    result_obj, error_msg, output = execute_and_extract_result(request.code)

    if error_msg:
        return ExecuteResponse(success=False, error=error_msg, output=output)

    try:
        with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cq.exporters.export(result_obj, tmp_path, exportType='STL')

            with open(tmp_path, 'rb') as f:
                stl_data = f.read()

            mesh_data = base64.b64encode(stl_data).decode('utf-8')

            return ExecuteResponse(success=True, meshData=mesh_data, output=output)
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        return ExecuteResponse(success=False, error=_format_error(e), output=output)


@router.post("/api/export", response_model=ExportResponse)
async def export_model(request: ExportRequest):
    result_obj, error_msg, _ = execute_and_extract_result(request.code)

    if error_msg:
        return ExportResponse(success=False, error=error_msg)

    format_lower = request.format.lower()
    if format_lower not in ['stl', 'step']:
        return ExportResponse(success=False, error="不支持的格式，请使用 STL 或 STEP")

    try:
        export_type = 'STL' if format_lower == 'stl' else 'STEP'
        filename = f"model.{format_lower}"

        with tempfile.NamedTemporaryFile(suffix=f'.{format_lower}', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cq.exporters.export(result_obj, tmp_path, exportType=export_type)

            with open(tmp_path, 'rb') as f:
                file_data = f.read()

            file_data_b64 = base64.b64encode(file_data).decode('utf-8')

            return ExportResponse(
                success=True,
                fileData=file_data_b64,
                filename=filename
            )
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        return ExportResponse(success=False, error=_format_error(e))
