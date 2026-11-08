#!/usr/bin/env python3
"""Optional Playwright/Chromium development check; no shipped dependencies."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("PSYCHE_CHROMIUM") or None)
    context = browser.new_context(viewport={"width": 1440, "height": 1100}, accept_downloads=True)
    page = context.new_page()
    errors, network = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: network.append(request.url) if request.url.startswith(("http:", "https:")) else None)
    page.goto((ROOT / "index.html").as_uri())
    page.wait_for_function("window.Psyche && document.getElementById('kernel-status').textContent.includes('PASS')")
    assert page.locator("#score").inner_text() == "67"
    assert page.locator("#case").input_value() == "fixed1616"
    assert "I invented Math" in page.locator("#verdict").inner_text()
    assert "Every calculator has been invoiced" in page.locator("#claim").inner_text()
    assert page.locator('a[href="https://doi.org/10.5281/zenodo.24049474"]').count() == 1
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    checks = page.evaluate("""() => {
      let n=0;
      for(let s=0;s<=8;s++)for(let e=0;e<=8;e++){
        const cpu=Psyche.run6502(s,e);
        if(cpu.score!==Math.min(99,11*s+7*e+(s?35:0))||cpu.evidence!==0)throw Error('parity');
        n++;
      }
      return n;
    }""")
    assert checks == 81
    page.screenshot(path=str(OUT / "desktop.png"), full_page=True)
    before = page.locator("#oracle").inner_text()
    page.get_by_role("button", name="Apply reality check").click()
    assert page.get_by_role("button", name="Return to the nonsense").get_attribute("aria-pressed") == "true"
    assert page.locator("#oracle").inner_text() == before
    assert "Earlier use" in page.locator("#claim").inner_text()
    assert "not proof of copying" in page.locator("#audit").inner_text()
    assert page.locator("#score").inner_text() == "67"
    with page.expect_download() as event:
        page.get_by_role("button", name="Download the receipt").click()
    receipt = json.loads(Path(event.value.path()).read_text())
    assert receipt["classification"] == "FICTIONAL SATIRE — NOT EVIDENCE"
    assert receipt["independentEvidenceItems"] == 0 and receipt["mode"] == "reality-check"
    page.get_by_label("Demonstration case").select_option("nothing")
    page.locator("#echoes").focus()
    page.keyboard.press("End")
    assert page.locator("#score").inner_text() == "56"
    page.get_by_role("button", name="Manufacture certainty").click()
    assert "No overlap?" in page.locator("#verdict").inner_text()
    page.get_by_role("button", name="Semicolons", exact=True).click()
    assert page.locator("#score").inner_text() == "99"
    assert page.get_by_role("button", name="Semicolons", exact=True).get_attribute("aria-pressed") == "true"
    page.locator("#echoes").focus()
    page.keyboard.press("Home")
    assert page.locator("#score").inner_text() == "46"
    page.get_by_role("button", name="Semicolons", exact=True).focus()
    page.keyboard.press("Space")
    assert page.locator("#score").inner_text() == "0"
    page.get_by_label("Demonstration case").select_option("canvas")
    for width in [375, 768, 1024]:
        page.set_viewport_size({"width": width, "height": 900})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Overflow at {width}"
        assert page.locator("#graph").bounding_box()["width"] > 200
    page.set_viewport_size({"width":375,"height":900})
    page.screenshot(path=str(OUT / "mobile.png"), full_page=True)
    page.get_by_text("Open the machine · arithmetic, language model & limitations", exact=True).click()
    assert page.locator("#trace").is_visible()
    assert "Evidence register $03 = 0" in page.locator("#trace").inner_text()
    assert not errors, errors
    assert not network, network
    browser.close()
    print("PASS browser: file:// boot, 81 pairs, controls, keyboard, reality check, JSON receipt, 3 responsive widths, no HTTP requests or page errors")
