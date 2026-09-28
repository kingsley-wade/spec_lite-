#!/usr/bin/env python3
"""Validate a Kiro-Lite spec directory."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


REQUIRED_FILES = {
    "requirements.md": [
        "# Requirements",
        "## Purpose",
        "## Scope",
        "## Functional Requirements",
        "## Approval",
    ],
    "design.md": [
        "# Design",
        "## Overview",
        "## Repository Tree Impact",
        "## Architecture",
        "## Testing Strategy",
        "## Approval",
    ],
    "tasks.md": [
        "# Tasks",
        "## Status Legend",
        "## Execution Rules",
        "## Task Checklist",
        "## Approval",
    ],
}

TASK_RE = re.compile(r"^- \[( |~|x|!)\] \d+(?:\.\d+)+ .+", re.MULTILINE)
FIELD_RE = {
    "Module": re.compile(r"^\s+- Module:\s+.+", re.MULTILINE),
    "Goal": re.compile(r"^\s+- Goal:\s+.+", re.MULTILINE),
    "Files": re.compile(r"^\s+- Files:\s+.+", re.MULTILINE),
    "Depends on": re.compile(r"^\s+- Depends on:\s+.+", re.MULTILINE),
    "Acceptance evidence": re.compile(r"^\s+- Acceptance evidence:\s+.+", re.MULTILINE),
}
PLACEHOLDER_RE = re.compile(r"<[^>\n]+>|TBD|TODO", re.IGNORECASE)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def validate_file(path: Path, required_sections: list[str]) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"missing required file: {path.name}"]
    text = read(path)
    for section in required_sections:
        if section not in text:
            errors.append(f"{path.name}: missing section {section!r}")
    return errors


def validate_tasks(path: Path) -> list[str]:
    errors: list[str] = []
    text = read(path)
    tasks = TASK_RE.findall(text)
    if not tasks:
        errors.append("tasks.md: no checklist tasks with valid status markers")
    for field, pattern in FIELD_RE.items():
        if not pattern.search(text):
            errors.append(f"tasks.md: missing task field {field!r}")
    in_progress = len(re.findall(r"^- \[~\] ", text, flags=re.MULTILINE))
    if in_progress > 1:
        errors.append("tasks.md: more than one task is marked in progress")
    return errors


def validate_placeholders(root: Path) -> list[str]:
    errors: list[str] = []
    for name in REQUIRED_FILES:
        path = root / name
        if not path.exists():
            continue
        matches = PLACEHOLDER_RE.findall(read(path))
        if matches:
            sample = ", ".join(sorted(set(matches))[:5])
            errors.append(f"{name}: unresolved placeholders or TODOs: {sample}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec_dir", type=Path, help="Directory containing requirements.md, design.md, and tasks.md")
    parser.add_argument("--allow-placeholders", action="store_true", help="Allow template placeholders in draft specs")
    args = parser.parse_args()

    root = args.spec_dir
    errors: list[str] = []

    if not root.exists() or not root.is_dir():
        errors.append(f"spec directory does not exist: {root}")
    else:
        for filename, sections in REQUIRED_FILES.items():
            errors.extend(validate_file(root / filename, sections))
        if (root / "tasks.md").exists():
            errors.extend(validate_tasks(root / "tasks.md"))
        if not args.allow_placeholders:
            errors.extend(validate_placeholders(root))

    if errors:
        print("Kiro-Lite spec validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Kiro-Lite spec validation passed: {root}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

