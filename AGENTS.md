# Repository Guidelines

>This repository contains product requirements and prompts for the AI 表情包生成器. Keep changes focused, reviewable, and consistent.

## Project Structure & Module Organization
- `spec/` – Specifications and prompts.
  - `spec/requirement.md` – V3.0 PRD (includes z-pay integration and download policy).
  - `spec/需求1.0提示词.md` – Prompt ideas/seed content.
- Use one topic per file. Keep version labels inside documents (e.g., header shows V3.0), not in filenames.

## Build, Test, and Development Commands
- No build pipeline. Recommended local tooling (optional):
  - `npx markdownlint "**/*.md"` – Lint Markdown.
  - `npx prettier -w spec/**/*.md` – Format Markdown.
  - `rg -n "keyword" spec` – Search within specs.

## Coding Style & Naming Conventions
- Headings: use `#`/`##`/`###`; keep depth ≤ 3 levels.
- Lists: `- ` with one space; keep bullets concise.
- Filenames: kebab-case (ASCII), e.g., `feature-overview.md`.
- Paths and literals in backticks: `spec/requirement.md:42`.
- Language: primary text in Chinese; code, paths, and identifiers in English.

## Testing Guidelines
- No automated tests. Before opening a PR:
  - Verify external links (e.g., z-pay docs URL).
  - Ensure acceptance criteria reflect any requirement changes.
  - Run markdownlint/prettier if you use them.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). One logical change per commit.
- PRs: include a short summary, rationale, impacted files (by path), and screenshots/snippets if UX copy changed. Link related issues.
- For breaking requirement changes, call them out explicitly in the PR description.

## Security & Configuration Tips
- Never commit credentials or merchant keys (e.g., z-pay secrets). Use placeholders and environment variables in examples.
- Redact sensitive URLs and IDs in screenshots/snippets.

## Agent-Specific Notes
- Keep diffs minimal and targeted; preserve existing tone and structure.
- Update only relevant sections; avoid renaming files unless justified.
- When referencing files, use clickable paths with optional line numbers (e.g., `spec/requirement.md:120`).
