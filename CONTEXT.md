# LinkForge MCP Context

## Core Innovation

LinkForge MCP improves on existing projects by:

1. **Semantic Tooling Instead of CRUD**: Tools should pre-filter at the server level, returning compressed, AI-ready summaries to reduce token load and latency.
2. **Token-Aware Response Compression**: Each tool returns structured, minimal, AI-optimized output.
3. **Context-Aware Query Layer**: Translates semantic intents to platform filters.
4. **Cross-Platform Schema Normalization**: Normalizes SaaS data (Task, Event) into unified models.
5. **Modular SaaS Adapters**: Each SaaS tool is an independent adapter sharing the core semantic engine.

## Rules

- Do NOT implement naive CRUD wrappers.
- Verify token-efficiency, latency, and semantic clarity for all tools.
- Ensure strict security (token storage, scoping).
