# Contributing to react-zeugma

Thank you for your interest in contributing! This document will help you get set up and guide you through the contribution process.

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/react-zeugma.git
cd react-zeugma

# 2. Install all workspace dependencies
npm install

# 3. Build the library
npm run build
```

### Development Scripts

| Command             | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Watch mode — rebuilds the library on file changes               |
| `npm run demo`      | Starts the interactive Vite demo app at `http://localhost:5173` |
| `npm run storybook` | Starts Storybook docs at `http://localhost:6006`                |
| `npm run build`     | Production build (CJS + ESM + `.d.ts`)                          |
| `npm run lint`      | Lint source files with ESLint                                   |
| `npm run typecheck` | Run TypeScript type-checking                                    |
| `npm run format`    | Format source files with Prettier                               |

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feat/my-feature
# or
git checkout -b fix/my-bugfix
```

### 2. Make Your Changes

- Write your code in `src/`
- Test interactively using `npm run demo` or `npm run storybook`
- Ensure `npm run lint` and `npm run typecheck` pass

### 3. Add a Changeset

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. Before committing, run:

```bash
npx changeset
```

This will prompt you to:

1. Select the package (`react-zeugma`)
2. Choose the semver bump type (`patch`, `minor`, or `major`)
3. Write a short summary of your change

A markdown file will be created in `.changeset/` — commit it with your PR.

### 4. Commit & Push

Commits are automatically linted and formatted by the pre-commit hook (via Husky + lint-staged).

```bash
git add .
git commit -m "feat: add cool new feature"
git push origin feat/my-feature
```

### 5. Open a Pull Request

- Open a PR against the `main` branch
- CI will automatically run lint, type-check, and build checks
- Fill out the PR template and link any relevant issues

---

## Code Style

- **TypeScript** is required for all source code
- **Prettier** handles formatting (config in `.prettierrc`)
- **ESLint** handles linting
- Keep components focused and tree-shakeable
- Prefer named exports over default exports

---

## Project Structure

```
react-zeugma/
├── src/                  # Library source code
│   ├── components/       # React components
│   ├── types.ts          # Core TypeScript types
│   └── index.ts          # Public API entry point
├── demo/                 # Interactive Vite demo app
├── docs/                 # Storybook stories & MDX documentation
├── .storybook/           # Storybook configuration
├── .changeset/           # Changeset configuration
├── .github/workflows/    # CI/CD workflows
├── dist/                 # Build output (gitignored)
└── package.json
```

---

## npm registry (Nexus)

Local installs use the Nexus group proxy via `.npmrc` (`http://localhost:8081/repository/npm-all/`). Publishing always targets the public npm registry through `publishConfig` in `package.json`, so `npm publish` and CI releases are not sent to the Nexus group repository.

Set `NPM_TOKEN` to an [npm automation token](https://www.npmjs.com/settings/~your-username/tokens) for releases:

```bash
cp .env.example .env   # edit .env and paste your token
npm run publish:npm    # loads .env, publishes to registry.npmjs.org
```

GitHub Actions needs the same value in the repository secret **NPM_TOKEN** (Settings → Secrets and variables → Actions).

`package-lock.json` uses `registry.npmjs.org` tarball URLs so CI on GitHub can install without reaching your local Nexus instance. After changing dependencies locally, run `npm install` through Nexus as usual; if the lockfile picks up `localhost` URLs again, normalize before pushing:

```bash
sed -i 's|http://localhost:8081/repository/npm-all/|https://registry.npmjs.org/|g' package-lock.json
```

---

## Releasing (Maintainers Only)

Releases are automated via Changesets + GitHub Actions:

1. Changesets on `master` trigger a "Version Packages" PR
2. Merging that PR automatically publishes to npm

---

## Questions?

Open an [issue](https://github.com/yusufarsln98/react-zeugma/issues) or start a [discussion](https://github.com/yusufarsln98/react-zeugma/discussions).

Thank you for helping make `react-zeugma` better! 🎉
