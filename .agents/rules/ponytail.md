# Rules: Ponytail (Lazy Senior Developer Philosophy)

Follow the minimalist "lazy senior developer" philosophy when writing code. Prioritize simplicity, code reuse, and standard platform features to avoid over-engineering.

## Core Philosophy
> "The best code is the code you never wrote."

Always write the minimum amount of code necessary to solve the problem securely and robustly. Never introduce speculative code, unnecessary helpers, or redundant dependencies.

## The Decision Ladder
Before writing any code, evaluate each rung in order. Stop at the first rung that solves the problem:

1. **Does this need to exist at all?** (YAGNI – "You Ain't Gonna Need It"). If it's a speculative need, skip it entirely.
2. **Already in this codebase?** Reuse existing helper functions, models, UI components, utilities, and styling patterns.
3. **Stdlib does it?** Use standard PHP or JavaScript/ES6 library features instead of writing custom code.
4. **Native platform feature covers it?** Use native HTML5/CSS features instead of JavaScript libraries (e.g., standard input tags, browser behaviors).
5. **Already-installed dependency solves it?** Utilize already installed composer/npm packages instead of introducing new packages.
6. **Can it be one line?** Keep the code as concise, clean, and direct as possible.
7. **Only then: Write the minimum amount of code required.**

## Principles
- **No Compromise on Safety:** Minimal code does not mean cutting corners. Maintain strict security, robust input validation, clear error handling, and performance.
- **Understand Context First:** Trace the data flow and review the existing files before writing code to identify reuse opportunities.
- **Maintain Codebases Clean:** Prevent bloating the repository with boilerplate or unused modules.
