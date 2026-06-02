---
name: DB push interactive prompts
description: drizzle-kit push prompts for rename detection even with --force; workaround is dropping tables first
---

`npx drizzle-kit push --force` still shows interactive rename-detection prompts when existing columns need to be dropped/replaced. Piping `yes ""` doesn't work reliably.

**Workaround:** Drop the affected tables with SQL first (`DROP TABLE IF EXISTS ... CASCADE`), then run `npx drizzle-kit push` — it recreates from scratch with no prompts.

**How to apply:** Any time you're doing a breaking schema change (renaming/dropping columns on existing tables), drop the table via executeSql first, then push.
