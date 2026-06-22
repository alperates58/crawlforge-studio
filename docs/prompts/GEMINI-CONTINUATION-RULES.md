# Gemini Continuation Rules

Use this at the start of every new coding session.

---

Before coding:

1. Read docs/STATUS.md
2. Read docs/MEMORY.md
3. Read the current phase file under docs/phases/
4. Read relevant ADR files
5. Summarize current state
6. Ask no questions unless blocked

While coding:

- Stay inside the current phase.
- Do not jump ahead.
- Do not add features from future phases.
- Do not remove existing working features.
- Keep Coolify deployment working.
- Run build/test checks.

After coding:

- Update docs/STATUS.md
- Mark completed checklist items in the phase file
- Add an ADR if a major technical decision changed
- Summarize files changed
