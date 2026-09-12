@AGENTS.md

You are working in the Expaura Platform codebase — follow AGENTS.md completely.
- Run `npm run lint` and `npm test` after any change; keep the build green.
- Ask before touch Prisma schema relations, auth/session logic, or dependencies.
- Use the repo's conventions (server actions in lib/actions, zod validation, inline-error UI, @/ imports) — do not introduce new libraries without approval.
- Never print or commit secrets; `.env` values stay out of code and markdown.