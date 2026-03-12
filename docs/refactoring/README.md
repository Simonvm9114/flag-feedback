# Refactoring Standards

Principles and checklist for maintaining decomposition, DRY, and reliability in the flag-feedback codebase.

- **[CHECKLIST.md](CHECKLIST.md)** – Main checklist for agent sessions and code reviews
- **[DECOMPOSITION.md](principles/DECOMPOSITION.md)** – Principles extending the decomposition checklist
- **[DRY.md](principles/DRY.md)** – Principles extending the DRY checklist
- **[RELIABILITY_AND_ERROR_HANDLING.md](principles/RELIABILITY_AND_ERROR_HANDLING.md)** – Principles extending the reliability checklist

---

## Extending the Refactoring Checklist

When adding new standards:

1. **Add to CHECKLIST.md** – Add a concise, actionable checkbox under the appropriate section (DECOMPOSITION, DRY, or RELIABILITY_AND_ERROR_HANDLING).

2. **Optionally extend the principle doc** – If the new item needs more explanation, add a short principle paragraph to the corresponding doc (DECOMPOSITION.md, DRY.md, or RELIABILITY_AND_ERROR_HANDLING.md). Principle docs expand on the checklist; they do not duplicate it.

3. **Keep it abstract** – State principles only. Do not reference specific files, module paths, or project structure. Implementation details belong in code docstrings.

4. **New section?** – If you add a new top-level section (e.g. SECURITY), create a new principle doc for it and link from the checklist Extensions list.
