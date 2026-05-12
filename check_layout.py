from playwright.sync_api import sync_playwright
import os

screenshot_path = os.path.join(os.path.dirname(__file__), "screenshot_layout.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})

    console_msgs = []
    page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}"))

    page.goto("http://localhost:3000", timeout=15000)
    page.wait_for_load_state("networkidle", timeout=15000)
    page.wait_for_timeout(3000)

    page.screenshot(path=screenshot_path, full_page=True)

    print("=== Page Title ===")
    print(page.title())

    print("\n=== Console Errors ===")
    errors = [m for m in console_msgs if m.startswith("[error]")]
    for e in errors[:10]:
        print(e)
    if not errors:
        print("None")

    print("\n=== DOM Structure ===")
    body = page.locator("body")
    children = body.locator("> *").all()
    for i, child in enumerate(children[:5]):
        tag = child.evaluate("el => el.tagName")
        cid = child.get_attribute("id") or ""
        cclass = child.get_attribute("class") or ""
        print(f"  body > {tag}#{cid}.{cclass[:60]}")

    print("\n=== Key Elements ===")
    checks = {
        "CodeMirror editor": ".CodeMirror",
        "Canvas (3D viewer)": "canvas",
        "Sidebar": "#sidebar, [class*='sidebar']",
        "Header/toolbar buttons": "button",
        "Status bar": "[class*='status']",
    }
    for name, selector in checks.items():
        count = page.locator(selector).count()
        print(f"  {name}: {'✅' if count > 0 else '❌'} (count: {count})")

    print("\n=== Button Texts ===")
    buttons = page.locator("button").all()
    for b in buttons[:20]:
        txt = b.inner_text().strip()[:30]
        if txt:
            print(f"  [{txt}]")

    print("\n=== Layout Dimensions ===")
    viewport = page.viewport_size
    print(f"  Viewport: {viewport}")

    editor_box = page.locator(".CodeMirror").bounding_box() if page.locator(".CodeMirror").count() > 0 else None
    canvas_box = page.locator("canvas").bounding_box() if page.locator("canvas").count() > 0 else None
    print(f"  Editor box: {editor_box}")
    print(f"  Canvas box: {canvas_box}")

    print(f"\nScreenshot saved: {screenshot_path}")
    browser.close()
