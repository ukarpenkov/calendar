"""Capture real 2027 app screens from the temporary Android emulator.

Usage: python3 docs/gp/screen/capture_emulator.py Turkey Indonesia Mexico
Requires the release APK already installed on emulator-5554. Changes only this
emulator's display override, app settings and screenshot data.
"""

from __future__ import annotations

import io
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
SERIAL = "emulator-5554"
PACKAGE = "com.prodyk.calendar"
LANGUAGES = {
    "Russia": ("Русский", 1, 1, "new-year"),
    "Turkey": ("Türkçe", 4, 23, "childrens-day"),
    "Indonesia": ("Bahasa Indonesia", 8, 17, "independence-day"),
    "Japan": ("日本語", 2, 11, "foundation-day"),
    "Mexico": ("Español", 9, 16, "independence-day"),
}
MONTH_NAMES = {
    "Russia": ("Январь", ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]),
    "Turkey": ("Ocak", ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]),
    "Indonesia": ("Januari", ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]),
    "Japan": ("1月", [f"{i}月" for i in range(1, 13)]),
    "Mexico": ("Enero", ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]),
}
UI = {
    "Russia": ("Настройки", "Следующий месяц", "Назад", "Отпуск", "Выбранный день"),
    "Turkey": ("Ayarlar", "Sonraki ay", "Geri", "Tatil", "Seçilen gün"),
    "Indonesia": ("Pengaturan", "Bulan berikutnya", "Kembali", "Liburan", "Hari terpilih"),
    "Japan": ("設定", "次の月", "戻る", "休暇", "選択した日"),
    "Mexico": ("Configuración", "Mes siguiente", "Volver", "Vacaciones", "Día seleccionado"),
}


def adb(*args: str, data: bool = False) -> bytes | str:
    p = subprocess.run(
        ["adb", "-s", SERIAL, *args], check=True, capture_output=True
    )
    return p.stdout if data else p.stdout.decode("utf-8", "replace")


def tap(x: int, y: int, delay: float = 1.5) -> None:
    adb("shell", "input", "tap", str(x), str(y))
    time.sleep(delay)


def swipe(x: int, y1: int, y2: int, ms: int = 420) -> None:
    adb("shell", "input", "swipe", str(x), str(y1), str(x), str(y2), str(ms))
    time.sleep(0.25)


def tree() -> ET.Element:
    adb("shell", "uiautomator", "dump", "/sdcard/window.xml")
    return ET.fromstring(adb("shell", "cat", "/sdcard/window.xml"))


def bounds_center(s: str) -> tuple[int, int]:
    x1, y1, x2, y2 = map(int, re.findall(r"\d+", s))
    return (x1 + x2) // 2, (y1 + y2) // 2


def tap_text(label: str) -> None:
    for attempt in range(4):
        for n in tree().iter("node"):
            a = n.attrib
            if (a.get("text") == label or a.get("content-desc") == label) and a.get("bounds"):
                x, y = bounds_center(a["bounds"])
                tap(x, y, 2.5)
                return
        swipe(530, 1600, 480)
    raise RuntimeError(f"UI label not visible: {label}")


def tap_accessible(label: str, *, top_only: bool = False) -> bool:
    for n in tree().iter("node"):
        a = n.attrib
        if a.get("content-desc") != label or a.get("clickable") != "true":
            continue
        x, y = bounds_center(a["bounds"])
        if top_only and y > 250:
            continue
        tap(x, y, 2)
        return True
    return False


def has_text(label: str) -> bool:
    return any((n.attrib.get("text") or "").casefold() == label.casefold() for n in tree().iter("node"))


def month_header(country: str, month: int) -> str:
    return f"{MONTH_NAMES[country][1][month - 1]} 2027"


def open_january(country: str, kind: str) -> None:
    january = MONTH_NAMES[country][0]
    for _ in range(4):
        for n in tree().iter("node"):
            a = n.attrib
            if a.get("clickable") == "true" and a.get("content-desc", "").startswith(january + ","):
                x, y = bounds_center(a["bounds"])
                tap(x, y, 2.5)
                if has_text(month_header(country, 1)):
                    return
        if kind == "10-inch":
            swipe(900, 200, 920)
        else:
            swipe(520, 500, 1700)
    raise RuntimeError(f"Could not open January for {country}/{kind}")


def set_display(kind: str) -> None:
    if kind == "phone":
        w, h, density = 1080, 1920, 420
    elif kind == "7-inch":
        w, h, density = 1080, 1920, 280
    else:
        w, h, density = 1920, 1080, 220
    adb("shell", "wm", "size", f"{w}x{h}")
    adb("shell", "wm", "density", str(density))
    time.sleep(2)


def start_year(kind: str) -> None:
    adb("shell", "am", "force-stop", PACKAGE)
    adb("shell", "am", "start", "-n", f"{PACKAGE}/.MainActivity")
    time.sleep(3)
    if kind == "10-inch":
        for _ in range(3):
            swipe(900, 200, 920)
    else:
        for _ in range(3):
            swipe(520, 500, 1700)
    time.sleep(1)


def capture(path: Path, *, crop_phone_form: bool = False) -> None:
    image = Image.open(io.BytesIO(adb("exec-out", "screencap", "-p", data=True)))
    if crop_phone_form:
        image = image.crop((27, 0, 1053, 1824))
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(path, "PNG", optimize=True)
    print(path.relative_to(ROOT), image.size, f"{path.stat().st_size / 1048576:.2f} MiB", flush=True)


def pick_day(day: int, kind: str, country: str) -> None:
    for _ in range(3):
        candidates = []
        for n in tree().iter("node"):
            a = n.attrib
            if a.get("text") != str(day) or not a.get("bounds"):
                continue
            x, y = bounds_center(a["bounds"])
            x1, y1, x2, y2 = map(int, re.findall(r"\d+", a["bounds"]))
            area = (x2 - x1) * (y2 - y1)
            if kind == "phone" and 780 <= y <= 1500:
                candidates.append((area, x, y))
            elif kind == "7-inch" and 500 <= y <= 1300:
                candidates.append((area, x, y))
            elif kind == "10-inch" and 100 <= y <= 900:
                candidates.append((area, x, y))
        if not candidates:
            raise RuntimeError(f"Day {day} not found on {country}/{kind} month screen")
        _, x, y = max(candidates)
        tap(x, y, delay=2)
        if has_text(UI[country][4]):
            return
    raise RuntimeError(f"Selected-day panel did not open for {country}/{kind}")


def capture_kind(country: str, kind: str) -> None:
    _, month, day, holiday_name = LANGUAGES[country]
    dest = ROOT / country / kind
    set_display(kind)
    start_year(kind)
    capture(dest / "01-year-overview.png")

    open_january(country, kind)

    for target_month in range(2, month + 1):
        if not tap_accessible(UI[country][1], top_only=True):
            raise RuntimeError(f"Next-month button missing for {country}/{kind}")
        if not has_text(month_header(country, target_month)):
            raise RuntimeError(f"Wrong month after navigation: {country}/{kind}/{target_month}")
    pick_day(day, kind, country)
    capture(dest / f"02-{holiday_name}.png")

    start_year(kind)
    for _ in range(3):
        if not tap_accessible(UI[country][3], top_only=True):
            raise RuntimeError(f"Vacation button missing for {country}/{kind}")
        nodes = [n.attrib for n in tree().iter("node")]
        cards = [a for a in nodes if a.get("clickable") == "true" and "2027" in a.get("content-desc", "") and "/ 7" in a.get("content-desc", "")]
        if cards:
            x, y = bounds_center(cards[0]["bounds"])
            tap(x, y, 2)
            break
    else:
        raise RuntimeError(f"Vacation period missing for {country}/{kind}")
    capture(dest / "03-vacation-plan.png", crop_phone_form=(kind == "phone"))


def select_country(country: str) -> None:
    set_display("phone")
    start_year("phone")
    if not tap_accessible(UI[country][0], top_only=True):
        # Settings is still labeled in the previously selected app language.
        for labels in UI.values():
            if tap_accessible(labels[0], top_only=True):
                break
        else:
            raise RuntimeError("Settings button missing")
    swipe(530, 1590, 480, 500)
    tap_text(LANGUAGES[country][0])
    print(f"Selected {country}", flush=True)


def main() -> None:
    for country in sys.argv[1:]:
        if country not in LANGUAGES:
            raise SystemExit(f"Unknown country: {country}")
        select_country(country)
        for kind in ("phone", "7-inch", "10-inch"):
            capture_kind(country, kind)


if __name__ == "__main__":
    main()
