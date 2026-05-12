import os
import base64
import tempfile

from fastapi import APIRouter

from backend.models import ExecuteRequest, ExecuteResponse, ExportRequest, ExportResponse
from backend.safety import validate_code_safety

router = APIRouter(tags=["execute"])

try:
    import cadquery as cq
except ImportError:
    print("警告: CadQuery 未安装，部分功能将不可用")
    cq = None


def execute_and_extract_result(code: str):
    if cq is None:
        return None, "CadQuery 引擎未安装，请检查后端依赖"

    is_safe, error_msg = validate_code_safety(code)
    if not is_safe:
        return None, error_msg

    try:
        namespace = {
            'cq': cq,
            'cadquery': cq,
        }

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
            return None, "未找到可显示的模型，请确保代码定义了 'result' 变量"

        return result_obj, None

    except Exception as e:
        return None, str(e)


@router.post("/api/execute", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest):
    result_obj, error_msg = execute_and_extract_result(request.code)

    if error_msg:
        return ExecuteResponse(success=False, error=error_msg)

    try:
        with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cq.exporters.export(result_obj, tmp_path, exportType='STL')

            with open(tmp_path, 'rb') as f:
                stl_data = f.read()

            mesh_data = base64.b64encode(stl_data).decode('utf-8')

            return ExecuteResponse(success=True, meshData=mesh_data)
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        return ExecuteResponse(success=False, error=str(e))


@router.post("/api/export", response_model=ExportResponse)
async def export_model(request: ExportRequest):
    result_obj, error_msg = execute_and_extract_result(request.code)

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
        return ExportResponse(success=False, error=str(e))
