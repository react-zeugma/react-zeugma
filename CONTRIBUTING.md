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

## Releasing (Maintainers Only)

Releases are automated via Changesets + GitHub Actions:

1. Changesets on `master` trigger a "Version Packages" PR
2. Merging that PR automatically publishes to npm

For a manual publish, create a token at [npm Access Tokens](https://www.npmjs.com/settings/yusufarsln98/tokens):

- **Granular Access Token:** Permissions → **Read and write packages** → enable **Bypass two-factor authentication (2FA)**
- Or **Classic token** → type **Automation** (if still offered)

A token that only passes `npm whoami` but fails publish with `EOTP` is missing bypass-2FA / Automation.

```bash
cp .env.example .env   # add NPM_TOKEN=
npm run publish:npm
# If prompted for OTP: add NPM_OTP=123456 to .env or run with your authenticator app
```

Add the same token as the **NPM_TOKEN** repository secret for GitHub Actions.

---

## Questions?

Open an [issue](https://github.com/yusufarsln98/react-zeugma/issues) or start a [discussion](https://github.com/yusufarsln98/react-zeugma/discussions).

Thank you for helping make `react-zeugma` better! 🎉
