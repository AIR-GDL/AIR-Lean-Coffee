---
description: Complete guide to using Conventional Commits in the project
auto_execution_mode: 1
---

# 🤖 AI Git Commit Workflow

## 1. Objective

Your task is to analyze code changes and generate a clear, descriptive, and strictly formatted commit message. This format combines the **Conventional Commits** specification with a corresponding **emoji** for quick visual identification.

## 2. Commit Process

When asked to make a commit, follow these steps:

1.  **Stage Changes:** Run `git add .` to stage all changes for the commit.
2.  **Analyze Diff:** Review the staged changes (the "diff") to understand the primary *intent* (e.g., is it fixing a bug? adding a feature? improving style?).
3.  **Determine Type & Emoji:** Based on your analysis, select the Conventional Commits `type` and the corresponding `emoji` from the mapping table (see Section 4).
4.  **Write Message:** Construct the commit message following the defined structure (see Section 3).
5.  **Execute Commit:** Run the command `git commit -m "YOUR_MESSAGE_HERE"`.

## 3. Commit Message Format

The commit message **MUST** follow this structure as example:

docs: EMOJI add comprehensive documentation for conventional commits and toast notifications

- Created detailed conventional commits guide with examples, workflow steps, and integration details
- Added toast notification usage guide documenting Sonner configuration and best practices
- Standardized header component usage across bugs and history pages by replacing custom headers with AppHeader
- Added Footer component to bugs and history pages for consistent layout
- Updated toast imports to use centralized @


### Components:

* **`EMOJI`**: (Required) The emoji from the list that best represents the change. It must be at the very beginning.
* **`type`**: (Required) The Conventional Commit type (e.g., `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`).
* **`[optional scope]`**: (Optional) A noun in parentheses describing the section of the codebase affected (e.g., `(api)`, `(parser)`, `(ui)`).
* **`:`**: (Required) A literal colon and a space separating the prefix from the description.
* **`description`**: (Required) A short summary of the code changes, in lowercase, without a period at the end.

### Breaking Changes

For changes that break existing functionality:
1.  Add a `!` after the `type` (or `scope`): `💥 feat(api)!: ...`
2.  Add a footer to the commit body:
    ```
    BREAKING CHANGE: description of the breaking API change.
    ```

## 4. Intent, Type, and Emoji Mapping

Use this table to select the correct `type` and `EMOJI` based on the change's intent.

| Change Intent | Conventional Type | Emoji (Your List) |
| :--- | :--- | :--- |
| **New Feature** | `feat` | ✨ `:sparkles:` |
| **Bug Fix** | `fix` | 🐛 `:bug:` |
| **Critical Hotfix** | `fix` | 🚑 `:ambulance:` |
| **Simple Fix** | `fix` | 🩹 `:adhesive_bandage:` |
| **Documentation** | `docs` | 📝 `:memo:` |
| **Styles (UI)** | `style` | 💄 `:lipstick:` |
| **Code Structure/Format** | `style` | 🎨 `:art:` |
| **Code Refactor** | `refactor` | ♻️ `:recycle:` |
| **Remove Dead Code** | `refactor` | ⚰️ `:coffin:` |
| **Performance Improvement** | `perf` | ⚡️ `:zap:` |
| **Tests** | `test` | ✅ `:white_check_mark:` |
| **Add Failing Test** | `test` | 🧪 `:test_tube:` |
| **Deploy** | `chore` | 🚀 `:rocket:` |
| **Upgrade Dependencies** | `chore` | ⬆️ `:arrow_up:` |
| **Downgrade Dependencies** | `chore` | ⬇️ `:arrow_down:` |
| **Add Dependency** | `chore` | ➕ `:heavy_plus_sign:` |
| **Remove Dependency** | `chore` | ➖ `:heavy_minus_sign:` |
| **Configuration** | `chore` | 🔧 `:wrench:` |
| **Dev Scripts** | `chore` | 🔨 `:hammer:` |
| **Fix CI Build** | `ci` | 💚 `:green_heart:` |
| **Update CI** | `ci` | 👷 `:construction_worker:` |
| **Revert Changes** | `revert` | ⏪ `:rewind:` |
| **Breaking Change** | `(type)!` | 💥 `:boom:` |
| **Security** | `fix` | 🔒 `:lock:` |
| **Move/Rename Files** | `chore` | 🚚 `:truck:` |
| **Accessibility** | `style` | ♿️ `:wheelchair:` |
| **Add/Update .gitignore** | `chore` | 🙈 `:see_no_evil:` |
| **Fix Typos** | `fix` | ✏️ `:pencil2:` |

## 5. Commit Examples

* **feat:** `✨ feat(auth): add Google login`
* **fix:** `🐛 fix(parser): correct parsing error with double quotes`
* **docs:** `📝 docs: update "Getting Started" section in README`
* **style:** `💄 style(header): adjust logo padding on mobile view`
* **refactor:** `♻️ refactor(user): move validation logic to service`
* **perf:** `⚡️ perf(db): add index to users table for query optimization`
* **test:** `✅ test(utils): add unit tests for "formatDate" function`
* **chore:** `🔧 chore(vite): update import alias configuration`
* **Breaking Change:** `💥 feat(api)!: change /user endpoint to /users`