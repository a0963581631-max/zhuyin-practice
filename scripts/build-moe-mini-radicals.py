#!/usr/bin/env python3
"""Build a compact lookup using the Ministry of Education Mini Dictionary.

Source: https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/dict_mini_download.html
Edition: 2019_20260929
Mirrored in: https://github.com/kemdict/kemdict-data-ministry-of-education
MOE dictionary data copyright: Ministry of Education (Taiwan), CC BY-ND 3.0 TW.
The raw fields `title` and `radical` are used unmodified as factual lookup values.
Never fetch or scrape dict.mini.moe.edu.tw web pages or call its private APIs.
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib.request import Request, urlopen

EDITION = "2019_20260929"
UPSTREAM_COMMIT = "eb82bd5c8666d30966eb62ef23fba3b39c3e03c5"
URL = (
    "https://raw.githubusercontent.com/kemdict/"
    "kemdict-data-ministry-of-education/"
    + UPSTREAM_COMMIT + "/dict_mini.json"
)
OUTPUT = Path("assets/data/moe-mini-radicals-20260929.json")


def build() -> None:
    request = Request(URL, headers={"User-Agent": "ResourceClass-MOE-Radical-Indexer/1.0"})
    with urlopen(request, timeout=90) as response:
        rows = json.load(response)
    if not isinstance(rows, list):
        raise ValueError("Expected an array of dictionary entries")

    lookup: dict[str, str] = {}
    conflicting: dict[str, set[str]] = {}
    for row in rows:
        if not isinstance(row, dict):
            continue
        character, radical = row.get("title"), row.get("radical")
        if not isinstance(character, str) or len(character) != 1 or not isinstance(radical, str):
            continue
        if not radical or len(radical) > 4:
            continue
        previous = lookup.setdefault(character, radical)
        if previous != radical:
            conflicting.setdefault(character, set()).update((previous, radical))
    if conflicting:
        print(f"Note: {len(conflicting)} entries have multiple radical values; keeping first entry.")
    if len(lookup) < 4000:
        print("DATA DEBUG", "rows:", len(rows), "example:", repr(rows[:4]))
        raise ValueError(f"Only {len(lookup)} distinct radicals; aborting incomplete deploy")
    for char, expected in {"花": "艸", "開": "門"}.items():
        actual = lookup.get(char)
        if actual not in {expected, "艹" if expected == "艸" else expected}:
            raise ValueError(f"MOE sample check failed: {char} -> {actual!r}, expected {expected!r}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(
            {"edition": EDITION, "source": "教育部《國語小字典》", "radicals": lookup},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"Built {len(lookup)} character radicals ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
