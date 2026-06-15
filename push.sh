#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────
#  push.sh — Quick GitHub push (Mac / Linux)
#  Safe: only affects Git history, never website behavior.
#  Do NOT change branch names in this file.
# ───────────────────────────────────────────────────────────

# Stage all changes in the repo
git add .

# Commit with a generic message (change "update" if desired)
git commit -m "update"

# Push to the remote repository on the current branch
git push
