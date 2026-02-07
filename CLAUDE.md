# CLAUDE.md - AI Assistant Guide

## Project Overview

This repository manages the City of Philadelphia's design tokens. It takes color tokens exported from Figma (in DTCG format) and transforms them into multiple output formats using [Style Dictionary](https://amzn.github.io/style-dictionary/).

## Repository Structure

```
/
├── colors.tokens.json     # Source tokens exported from Figma (DTCG format)
├── config.json            # Style Dictionary configuration
├── package.json           # Node.js dependencies
├── build/                 # Generated output files (do not edit manually)
│   ├── css/              # CSS custom properties
│   ├── scss/             # Sass variables and maps
│   ├── less/             # Less variables
│   ├── js/               # JavaScript ES6 modules
│   ├── ts/               # TypeScript declarations
│   ├── json/             # JSON formats
│   ├── android/          # Android XML resources
│   ├── compose/          # Jetpack Compose (Kotlin)
│   ├── ios/              # iOS Objective-C
│   ├── ios-swift/        # iOS Swift
│   └── flutter/          # Flutter Dart
└── .github/workflows/    # CI automation
```

## Key Files

| File | Purpose |
|------|---------|
| `colors.tokens.json` | Source of truth - Figma-exported tokens in DTCG format |
| `config.json` | Style Dictionary config defining all output platforms |
| `build/**/*` | Auto-generated files - never edit directly |

## Commands

```bash
npm install        # Install Style Dictionary
npm run build      # Generate all output formats
```

## Token Format

Tokens use the Design Token Community Group (DTCG) JSON format:

```json
{
  "Colors/Mode 1": {
    "token-name": {
      "$type": "color",
      "$value": "#hexcode",
      "$description": "Optional description"
    }
  }
}
```

## Output Formats (12 platforms)

| Platform | Transform Group | Output Files |
|----------|-----------------|--------------|
| CSS | `css` | `variables.css` |
| SCSS | `scss` | `_variables.scss`, `_map-flat.scss`, `_map-deep.scss` |
| Less | `less` | `variables.less` |
| JavaScript | `js` | `tokens.js`, `tokens-module.js` |
| TypeScript | `js` | `tokens.d.ts`, `tokens-module.d.ts` |
| JSON | `js` | `tokens.json`, `tokens-flat.json`, `tokens-nested.json` |
| Android | `android` | `colors.xml`, `resources.xml` |
| Compose | `compose` | `Tokens.kt` |
| iOS | `ios` | `tokens.h`, `tokens.m` |
| iOS Swift | `ios-swift` | `Tokens.swift`, `TokensEnum.swift` |
| Flutter | `flutter` | `tokens.dart` |

## Development Workflow

1. **Updating tokens**: Edit `colors.tokens.json` with new/modified tokens from Figma
2. **Regenerating outputs**: Run `npm run build`
3. **Commit both**: Always commit both the source tokens AND the generated `build/` files

## CI/CD

GitHub Actions (`.github/workflows/style-dictionary.yml`) automatically:
- Triggers on push to `main` when `colors.tokens.json` or `config.json` changes
- Runs Style Dictionary build
- Commits generated files back to the repo

## Common Tasks

### Adding a new token
1. Add the token to `colors.tokens.json` under `"Colors/Mode 1"`
2. Run `npm run build`
3. Commit both files

### Adding a new output format
1. Add a new platform to `config.json` under `"platforms"`
2. Run `npm run build` to verify
3. Update `.github/workflows/style-dictionary.yml` to include new build paths
4. Commit all changes

## Naming Conventions

- Token names use **kebab-case** (e.g., `dark-ben-franklin-blue`)
- Philadelphia-themed color names (Ben Franklin Blue, Kelly Drive Green, Phanatic Green, etc.)
- Background colors use `-bg` suffix (e.g., `light-bell-bg`)

## Gotchas

- **Config typo**: The key is `transformGroup` (not `trasnformGroup`)
- **Build directory**: Files are organized as `build/<platform>/` not flat in `build/`
- **Generated files**: Everything in `build/` is auto-generated - never edit manually
