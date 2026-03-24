# Repository Guidelines

## Project Purpose
`11ty-starter` is the owner's personal starter project for building client websites with Eleventy. It is open source, but it is not designed as a general-purpose product for outside users. The goal is to make new project setup faster for the owner and to keep long-lived client sites easier to maintain over time.

`11ty-starter-common` is a permanent part of that design. It contains shared components, utilities, and operational patterns that all sites created from `11ty-starter` can inherit. Projects based on this starter can pull updated shared behavior with `npm run tools:pull`, which is how fixes, improvements, and new shared features flow into existing sites.

Agents should optimize for that goal: keep things customizable, overrideable, and easy to understand. Avoid introducing unnecessary abstraction, clever structure, or organizational churn that makes the starter harder to use.

## Project Structure & Module Organization
Source files live in `src/`. Page templates such as `src/index.njk` and `src/llms.njk` are built by Eleventy into `docs/`, which is the generated output directory and should be treated as build artifact output. Shared data lives in `src/_data/`, reusable layouts/includes live in `src/_includes/`, and site assets live under `src/assets/` (`css/`, `js/`, `img/`, and `assets.json`). Root config is handled by [`.eleventy.js`](/Users/aubreypwd/Sites/11ty/11ty-starter/.eleventy.js), which extends the common setup in `src/_includes/11ty-starter-common/`.

`src/_includes/11ty-starter-common/` is a Git subtree mirror of the shared `11ty-starter-common` project. It is not a standalone app and is inherently tied to `11ty-starter`. Treat it as upstream-managed shared infrastructure: make changes there only when the work truly belongs in the common layer, and keep repository-specific customization in the root project where possible.

File locations should be treated as stable. Moving files around, especially inside `11ty-starter-common`, is usually a bad idea because future subtree updates can shift paths into existing projects and break overrides or references. Prefer extending existing paths and patterns over reorganizing them.

## Build, Test, and Development Commands
- `npm run serve`: clears `docs/` and starts Eleventy dev server on port `8083`.
- `npm run build`: clears `docs/` and creates a production build.
- `npm run reset`: removes generated output from `docs/`.
- `npm run netlify:dev`: runs the site through Netlify Dev locally.
- `npm run netlify:live`: starts Netlify Dev with a live tunnel.

These commands document the normal local workflow, but agents should generally not run them. The repository owner typically runs `npm run ...` commands manually.

## Coding Style & Naming Conventions
This codebase loosely follows WordPress-style formatting. Use tabs for indentation, single quotes in JavaScript, semicolons, and readable vertical spacing between logical blocks. Prefer spaced control and function parentheses when touching existing project files, for example `function ( value )` and `if ( condition )`, and keep multiline objects and arrays trailing-comma friendly when that is already the local pattern. Align new code to the surrounding file instead of forcing a different house style into it.

Do not use Prettier, ESLint auto-fix, or any other formatter to rewrite files. Formatting here is intentional and hand-maintained. Make minimal edits, preserve existing whitespace where practical, and avoid large formatting-only diffs.

Keep CommonJS module syntax in config and data files. Use descriptive lowercase file names for assets such as `critical.css` and `main.js`, and keep Nunjucks templates in `.njk` files. Prefer small, focused data modules in `src/_data/` over embedding large configuration blocks in templates.

## Testing Guidelines
This starter does not define an automated test suite yet. In practice, the repository owner performs testing and validation after agent changes, including `npm run build`, local serving, and manual inspection of generated output in `docs/`. Agents should not assume they need to run test or build commands unless explicitly asked.

## Commit & Pull Request Guidelines
No repository-specific commit convention is documented in local files, so use short imperative commit subjects such as `Add homepage hero copy` or `Refactor site metadata`. Keep pull requests focused, explain the user-facing impact, list validation steps, and include screenshots when layout or rendered output changes.

## Agent-Specific Notes
The following rules are mandatory for automated agents and contributors acting on behalf of the owner:
- Never create Git commits on the user's behalf.
- Never run Git commands that modify any remote state, including pushes, remote pulls, subtree sync commands, or similar write operations.
- Avoid using Python for repository tasks when standard shell tools or existing project commands can do the job.
- Prefer normal file edits and standard system utilities for inspection.
- Do not modify files in `node_modules/`; treat installed dependencies as vendor code unless the user explicitly asks otherwise.
- Do not modify files in `docs/`; it is generated build output and should only change when the owner runs the build.
- Do not modify `.netlify/` unless the user explicitly asks for work there.
- `.githooks/` may be modified, but only when the user explicitly asks for changes in that directory.
- Do not run `npm run ...` commands, build steps, or test steps unless the user explicitly asks; the owner usually runs those commands and validates agent work personally.
- Preserve the update path between `11ty-starter` and `11ty-starter-common`; avoid changes that make shared code harder to pull into existing projects.
- Favor straightforward, override-friendly solutions over deep nesting, heavy indirection, or major structural reshuffles.
- Treat `src/_includes/11ty-starter-common/includes/layouts/partials/` as shared layout-building partials. They are meant to be reused by custom project layouts and may depend on normal layout, page, and site context.
- Do not convert layout partials into macros by default. In this starter, many layout partials are orchestration templates that loop over data, decide what a layout should emit, and then call lower-level reusable primitives such as shortcodes or existing macros.
- Prefer a shortcode or macro when the thing being built is a true reusable primitive that should be callable outside a layout, should accept explicit inputs at the callsite, or should act like a component with a stable API.
- Prefer a layout partial when the template is mainly assembling the page shell, reading current layout/page/site context, or coordinating other primitives for `<head>`, `<body>`, bundles, scripts, styles, metadata, or similar layout concerns.
- A useful test is: if the reusable part already exists as a shortcode or macro underneath, keep the higher-level layout orchestration as a partial. Do not promote orchestration templates into macros just because they live in `_includes`.
- Another useful test is: if calling the template somewhere else on the page would still make conceptual sense and improve customization, it may deserve a dedicated macro or shortcode. If it only really makes sense as part of layout composition, keep it as a partial.
- When in doubt, keep the layout layer simple and explicit. Add a dedicated componentized primitive only when there is a real reuse case outside layout composition, not just possible future reuse.
- When adding or refactoring overrideable config, prefer `required.deepmerge( base, override )` over object spread for override composition.
- In shared config modules, let `src/_data/site.js` drive feature toggles through `site.disabled` and feature-specific config through `site.configs`. Features are enabled by default unless their name is included in `site.disabled`.
- Scope shared config overrides by the API being invoked instead of by ad hoc nested shapes. Examples: `site.configs['setTemplateFormats']`, `site.configs.metagen['addPlugin']['eleventy-plugin-metagen']`, `site.configs.bundle['addPlugin']['EleventyRenderPlugin']`, `site.configs.bundle['addBundle']['css']`, `site.configs.css['addExtension']['css']`, `site.configs.js['addExtension']['js']`, `site.configs.js['build']['esbuild']`, `site.configs.sanitizeCss['addPassthroughCopy']['sanitize.css']`, `site.configs.eleventyImageTransformPlugin['addPlugin']['eleventyImageTransformPlugin']`.
- When a function call already has a clear target name, reuse that exact target as the override key rather than inventing a second naming scheme.
- When a required module is only used once, prefer calling `require( ... )` inline instead of assigning it to a temporary variable first. If the module will be reused, referenced multiple times, or the inline form would hurt readability, assign it to a variable instead.

## Simplicity Preference
When there are multiple valid implementations, prefer the one with less code, fewer temporary variables, and less scaffolding, as long as the result stays readable and does not break expected behavior.

Do not add extra abstraction or defensive code just to preserve an implementation pattern if a simpler version is acceptable in this project. In templates especially, prefer direct expressions over setup variables when the output remains clear enough to maintain.
