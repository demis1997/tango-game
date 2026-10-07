# tango-game

React/TypeScript sun-and-moon logic puzzle with a local engine and Vitest tests.

## Local development

Commands below come from the checked-in manifest; they were inspected, not executed during this repository pass. Use an isolated local checkout without production credentials.

```sh
npm ci --ignore-scripts
npm run dev
npm run build
npm run lint
npm run test
```

Install hooks are disabled in the example to avoid automatic downloads, compilation or deployment. If the application needs an install-time generator, follow its existing project instructions after review. Environment requirements must be checked in the source before enabling external integrations; no credentials are supplied by these examples.

Stack observed in the manifest: react, vite. The presence of a script is not proof its check passes.

No repository-wide license file was found; no license has been assigned by this maintenance change.

## Existing notes and attribution

# Tango

Daily and unlimited sun & moon logic puzzles.

## Play

```bash
npm install
npm run dev
```

## Modes

- **Daily** (`/`) — one shared puzzle per calendar day
- **Unlimited** (`/play/:seed`) — endless boards with shareable seeds
- **Archive** — replay past dailies
- **Stats** — streaks and solve counts
- **How to Play** — rules and strategy

Progress is stored locally in your browser.
