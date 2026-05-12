import re
from backend.config import HIGH_RISK_PATTERNS


def validate_code_safety(code: str) -> tuple[bool, str]:
    for pattern in HIGH_RISK_PATTERNS:
        if re.search(pattern, code):
            return False, f"代码包含高风险操作: {pattern}"

    return True, ""
