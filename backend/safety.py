import re

BLOCKED_PATTERNS = [
    (r'\bimport\s+os\b', '禁止导入 os 模块'),
    (r'\bimport\s+sys\b', '禁止导入 sys 模块'),
    (r'\bimport\s+subprocess\b', '禁止导入 subprocess 模块'),
    (r'\bimport\s+shutil\b', '禁止导入 shutil 模块'),
    (r'\bimport\s+pickle\b', '禁止导入 pickle 模块'),
    (r'\bimport\s+importlib\b', '禁止导入 importlib 模块'),
    (r'\bimport\s+socket\b', '禁止导入 socket 模块'),
    (r'\bimport\s+http\b', '禁止导入 http 模块'),
    (r'\bimport\s+urllib\b', '禁止导入 urllib 模块'),
    (r'\bimport\s+requests\b', '禁止导入 requests 模块'),
    (r'\bfrom\s+os\b', '禁止从 os 模块导入'),
    (r'\bfrom\s+sys\b', '禁止从 sys 模块导入'),
    (r'\bfrom\s+subprocess\b', '禁止从 subprocess 模块导入'),
    (r'\bfrom\s+shutil\b', '禁止从 shutil 模块导入'),
    (r'\bfrom\s+importlib\b', '禁止从 importlib 模块导入'),
    (r'\bfrom\s+socket\b', '禁止从 socket 模块导入'),
    (r'\bfrom\s+http\b', '禁止从 http 模块导入'),
    (r'\bfrom\s+urllib\b', '禁止从 urllib 模块导入'),
    (r'\bfrom\s+requests\b', '禁止从 requests 模块导入'),
    (r'\b__import__\s*\(', '禁止使用 __import__'),
    (r'\bopen\s*\(', '禁止使用 open()'),
    (r'\beval\s*\(', '禁止使用 eval()'),
    (r'\bexec\s*\(', '禁止使用 exec()'),
    (r'\bcompile\s*\(', '禁止使用 compile()'),
    (r'\bglobals\s*\(', '禁止使用 globals()'),
    (r'\blocals\s*\(', '禁止使用 locals()'),
    (r'\bgetattr\s*\(', '禁止使用 getattr()'),
    (r'\bsetattr\s*\(', '禁止使用 setattr()'),
    (r'\bdelattr\s*\(', '禁止使用 delattr()'),
    (r'\b__builtins__\b', '禁止访问 __builtins__'),
    (r'\b__file__\b', '禁止访问 __file__'),
    (r'\b__class__\b.*\.__subclasses__', '禁止通过 __subclasses__ 绕过沙箱'),
    (r'\bctypes\b', '禁止使用 ctypes'),
    (r'\bmultiprocessing\b', '禁止使用 multiprocessing'),
    (r'\bthreading\b', '禁止使用 threading'),
    (r'\bpathlib\b', '禁止使用 pathlib'),
]


def validate_code_safety(code: str) -> tuple[bool, str]:
    for pattern, message in BLOCKED_PATTERNS:
        if re.search(pattern, code):
            return False, message
    return True, ""
