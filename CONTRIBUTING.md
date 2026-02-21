# Contributing to LinkForge MCP

First off, thank you for considering contributing to LinkForge MCP! We welcome contributions to enhance existing SaaS adapters, add new ones, or improve the core semantic engine.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker to see if the problem has already been reported. When reporting a bug, include:

- A clear and descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Relevant logs or error messages.

### Suggesting Enhancements

Enhancement suggestions are welcome! Include:

- The problem your enhancement solves.
- A detailed description of the proposed feature.
- Relevant SaaS APIs or token compression strategies you are targeting.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. Ensure you have installed the dependencies: `npm install`
3. Make your changes in a separate branch (`git checkout -b my-new-feature`).
4. Follow the coding style guidelines. Run `npm run build` to verify there are no TypeScript errors.
5. Create a Pull Request with a clear description of the problem and the solution.

## Coding Standards

### TypeScript

- Write clean and strictly typed TypeScript.
- Avoid using `any` wherever possible. Define proper interfaces for data models and API responses.
- Ensure all logic aligns with our core philosophy: **compression and semantic tooling**. Do not expose raw CRUD endpoints.

### Commits

- Use semantic commit messages (e.g., `feat: added Notion adapter`, `fix: rate limiter loop hole`).

### Testing

- When testing the server, use `npm run dev` to watch changes.
- Ensure that the MCP client can successfully discover and invoke the tools.

Thank you for contributing!
