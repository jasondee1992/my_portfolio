# AGENTS.md

## Purpose
This repository is a personal portfolio built with Next.js App Router, TypeScript, Tailwind CSS v4, and Framer Motion. It also includes a portfolio chatbot backed by local JSON knowledge files and the OpenAI Responses API.

Agents working in this repo should preserve the existing premium dark visual language, avoid unnecessary rewrites, and prefer focused edits over broad refactors.

## Preferred Workflow
- Use `pnpm` for package and script commands. The repo is pinned to `pnpm@10`.
- Make small, reviewable changes. Do not reformat unrelated files.
- Before changing chatbot behavior, inspect both the API route and the knowledge dataset files.
- Before changing visuals, inspect `src/app/globals.css` and the nearest existing component in the same section.
- Run the narrowest relevant verification after edits.

## Common Commands
- `pnpm dev` - start the local dev server
- `pnpm lint` - run ESLint
- `pnpm test:chatbot-intents` - run chatbot intent regression checks
- `pnpm sync:logo` - regenerate favicon/app icons from `public/icons/logo/logo_tab.png`
- `pnpm build` - production build check

## Environment Notes
- Secrets live in `.env.local`. Do not print or copy secret values into logs, code, or docs.
- The chatbot route expects `OPENAI_API_KEY`.
- Optional environment variables already used by the app:
  - `OPENAI_MODEL`
  - `NEXT_PUBLIC_SITE_URL`

## Logging Storage Notes
- Local development uses a single SQLite database for chat logs, site visits, and admin-managed projects.
- Production may use DynamoDB for logging.
- SQLite logging tables auto-add expected columns on startup when new log fields are introduced.
- DynamoDB is schema-less, so new attributes do not require a table migration.
- Older DynamoDB items will not automatically contain newly added attributes; admin views and exports should handle missing values safely.
- Projects use SQLite locally and may use DynamoDB in production when `DYNAMODB_PROJECTS_TABLE` is configured.
- When changing logging or admin-managed content fields, verify both SQLite and DynamoDB code paths.

## Repo Map
- `src/app` - App Router pages, layout, global CSS, and API routes
- `src/app/api/chat/route.ts` - portfolio chatbot endpoint
- `src/components` - shared site sections and page-specific UI
- `src/components/about` - About page sections
- `src/components/gallery` - gallery page UI and lightbox/grid clients
- `src/components/projects` - projects page UI
- `src/components/redesign` - alternate redesigned landing page components; preserve unless the task explicitly targets them
- `src/data` - content and portfolio data
- `src/data/knowledge` - chatbot knowledge base JSON files
- `src/lib/chatbot` - retrieval, prompting, filtering, follow-up resolution, and response shaping
- `public` - static images and icons
- `scripts` - maintenance and regression scripts

## Architecture Guidance

### App Router
- Prefer server components by default.
- Add `"use client"` only when interaction, browser APIs, or animation state requires it.
- Keep route-level metadata in App Router conventions already used by the project.

### Styling
- Global design tokens and utility-like classes live in `src/app/globals.css`.
- Reuse the existing tokens such as `--bg-*`, `--text-*`, `--accent`, `glass-card`, `premium-button`, and related section helpers before inventing new patterns.
- Preserve the current look: dark, layered, glassy panels, soft borders, and motion with restraint.
- Keep responsive behavior explicit and preserve `prefers-reduced-motion` support when editing animated UI.

### Content and Data
- Prefer editing structured content in `src/data` over hardcoding copy inside components.
- Keep portfolio facts consistent across page content and chatbot knowledge files.

### Chatbot
- Treat `src/app/api/chat/route.ts` and `src/lib/chatbot/*` as one system. Changes in intent handling often require updates in more than one file.
- When editing intent or scope behavior, check:
  - `src/data/knowledge/chatbot-intent-dataset.json`
  - `src/lib/chatbot/questionScope.ts`
  - `src/lib/chatbot/safeIntents.ts`
  - `src/lib/chatbot/followUpResolver.ts`
- After chatbot intent changes, run `pnpm test:chatbot-intents`.
- Preserve safety boundaries already implemented for restricted or out-of-scope questions.
- Do not broaden chatbot claims beyond facts supported by the knowledge files.

## Change Rules
- Do not replace the design system with generic templates.
- Do not silently remove animation, SEO metadata, or chatbot safeguards unless the task requires it.
- Do not rename or move knowledge files without updating all dependent imports and scripts.
- Do not introduce a new package if the task can be completed with the current stack.
- Do not expose secret environment values in code, screenshots, test output, or documentation.

## Verification Expectations
- For UI-only changes: run `pnpm lint` and, when practical, `pnpm build`.
- For chatbot logic or dataset changes: run `pnpm test:chatbot-intents` and `pnpm lint`.
- For icon/logo changes: run `pnpm sync:logo` and verify the generated files in `src/app`.

## Editing Priorities
1. Match the existing structure and style before introducing anything new.
2. Keep edits local to the feature or section being changed.
3. Prefer data updates over duplicated JSX content.
4. Verify behavior with the smallest relevant command set.

## Notes For Future Agents
- The current `README.md` is still generic create-next-app boilerplate. Do not assume it reflects the real project workflow.
- The repo includes both primary components and `src/components/redesign`; confirm which path the user wants before making broad landing-page changes.

## Chatbot Behavior Rules

### Scope priority
- If a question is clearly about me, my profile, my work, my projects, my skills, my experience, my background, my goals, my availability, my AI exposure, or my tools, treat it as IN-SCOPE first before fallback.
- Only use out-of-scope fallback for truly unrelated topics.

### Conversational categories
Treat these as conversational, not out-of-scope:
- what do you want to discuss
- what can we talk about
- ano ba gusto mong pag usapan
- anong pwede kong itanong

Expected behavior:
- offer allowed topics such as projects, skills, experience, background, tech stack, AI tools, availability, and portfolio

### Reaction handling
Treat these as reaction_or_emotion, not topic questions:
- haha
- hahaha
- hehe
- lol
- wow
- nice
- grabe
- omg
- 😂
- 👍

Expected behavior:
- short natural reaction only

### Acknowledgment handling
Treat these as acknowledgment_only:
- okay
- ok
- noted
- got it
- copy
- understood
- alright
- sige

Expected behavior:
- short acknowledgment only
- do not repeat the previous long answer
- do not continue the previous topic

### Accept previous offer
Treat only these as accept_previous_offer when the previous assistant message contains an offer:
- yes
- yes please
- sige please
- go ahead
- continue
- tell me more
- please do

Expected behavior:
- continue the previously offered topic
- do not treat these as standalone topics
- do not trigger out-of-scope fallback

### Profile and recruiter question coverage
Treat these as in-scope categories:
- self_intro
- current_role
- work_experience
- professional_background
- strongest_skills
- strengths_as_developer
- tech_stack
- projects_summary
- best_project
- proudest_project
- work_availability
- freelance_availability
- contact_info
- goals_in_five_years
- passions
- hobbies_or_free_time
- role_fit_skills
- why_apply
- motivation_for_role
- react_experience
- bedrock_experience
- ai_tools_experience
- local_llm_experience
- open_model_familiarity

### Answer-source priority
For in-scope profile questions, prefer:
1. homepage
2. about
3. projects
4. personal knowledge / memory
5. fallback only if not covered

### AI answer style
When answering AI / LLM / model questions:
- be accurate and grounded
- do not exaggerate
- present experience as hands-on exposure, experimentation, internal project usage, and practical learning where appropriate

### Regression checks after chatbot edits
After chatbot intent or routing changes, verify:
- acknowledgments do not repeat long answers
- accept_previous_offer still works
- profile and recruiter questions stay in-scope
- AI / React / Bedrock / local LLM questions stay in-scope
- out-of-scope fallback still works for truly unrelated topics
