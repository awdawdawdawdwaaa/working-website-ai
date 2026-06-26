#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────
#  push.sh — Quick GitHub push (Mac / Linux)
#  Safe: only affects Git history, never website behavior.
#  Do NOT change branch names in this file.
# ───────────────────────────────────────────────────────────

# Stage all changes in the repo
git add .


git commit -m "update"


git push
