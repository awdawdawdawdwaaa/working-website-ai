@echo off
REM ───────────────────────────────────────────────────────────
REM  push.bat — Quick GitHub push (Windows)
REM  Safe: only affects Git history, never website behavior.
REM  Do NOT change branch names in this file.
REM ───────────────────────────────────────────────────────────

REM Stage all changes in the repo
git add .

REM Commit with a generic message (change "update" if desired)
git commit -m "update"

REM Push to the remote repository on the current branch
git push

REM Keep window open so you can see the result
pause
