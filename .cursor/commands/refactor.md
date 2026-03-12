Work through every section of `docs/refactoring/CHECKLIST.md` systematically:

1. Read each item.
2. Check compliance in all relevant files.
3. Make fixes before moving to the next item.

**Note:** Use a copy of the checklist (e.g. in memory or a scratchpad) to track progress. Do not directly edit `CHECKLIST.md`—leave it in its unchecked state for reuse across sessions.

When the checklist is complete, run:

```powershell
npm run lint
npm run build
```

If anything fails, fix it and re-run before reporting done. Finish with a summary of all changes made.
