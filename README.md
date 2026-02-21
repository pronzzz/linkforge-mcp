# LinkForge MCP

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue.svg)

> *"The Missing SaaS Link"*

LinkForge MCP serves as an AI-native interface, replacing raw complex CRUD operations with token-optimized semantic querying and insights. By providing pre-filtered, AI-ready intelligence instead of raw data dumps, LinkForge significantly reduces token load and latency for Large Language Models.

---

## 🚀 Core Innovation

LinkForge MCP improves on existing projects by:

1. **Semantic Tooling Instead of CRUD**: Tools pre-filter at the server level, returning compressed, AI-ready summaries.
2. **Token-Aware Response Compression**: Each tool returns structured, minimal, AI-optimized output.
3. **Context-Aware Query Layer**: Translates semantic intents to platform filters.
4. **Cross-Platform Schema Normalization**: Normalizes SaaS data (e.g., Tasks, Events) into unified models.
5. **Modular SaaS Adapters**: Each SaaS integration is an independent adapter sharing the core semantic engine.

## 🏗️ Architectural Layers

### 1. The Core Server & Semantic Compression

- **Location:** `src/core/server.ts` & `src/core/compression.ts`
- **What it does:** Replaces raw data dumps with AI-optimized strings. The `TokenCompressionLayer` drops null objects, empty properties, and restructures objects into simple `\n`-delimited semantic summaries.

### 2. The Semantic Query Engine

- **Location:** `src/core/query.ts` & `src/core/intent.ts`
- **What it does:** Classifies AI queries (like `isUrgent` or `upcoming`) into a standardized `SemanticQuery`. The `QueryTranslator` maps this intent object to specific platform API search terms.

### 3. Modular SaaS Adapters

The system provides several mock SaaS adapters that prove the architecture works. Instead of exposing dozens of complex pagination and filter endpoints, we expose pure insights:

#### Todoist

- `todoist_get_overdue_high_priority_tasks`
- `todoist_get_tasks_due_today`
- **Result:** Converts missing fields, normalizes priority, calculates exact dates automatically.

#### Linear

- `linear_get_blocked_high_priority_issues`
- `linear_get_unassigned_urgent_issues`
- **Result:** Automatically groups tickets based on GraphQL state mappings (`Todo`, `In Progress`, `Done`, `Blocked`).

#### Spotify

- `spotify_get_recently_skipped_tracks`
- `spotify_get_most_replayed_tracks_last_week`
- `spotify_get_focus_music_playlists`
- **Result:** Generates AI-actionable summaries (`"Frequently Skipped"`, `"Heavy Rotation"`) rather than raw track metadata.

#### Strava

- `strava_get_injury_risk_pattern`
- `strava_get_longest_effort_last_30_days`
- `strava_get_declining_pace_runs`
- **Result:** Analyzes heart rate distributions over pace times to flag `"High Exhaustion/Injury Risk Run"`.

### 4. Performance & Security

- **Token Budgeting (Cache):** `src/core/cache.ts` introduces time-to-live memorization to avoid hitting rate limits.
- **AI Loop Defense:** `src/core/security.ts` tracks invocation counts per AI tool over rolling windows, safely breaking the AI out of infinite loops via MCP errors.

---

## 🛠️ Quick Start

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Installation

```bash
git clone https://github.com/pronzzz/linkforge-mcp.git
cd linkforge-mcp
npm install
```

### Running the Server

To build the TypeScript source and run the server:

```bash
npm run build
npm start
```

For development with hot-reloading:

```bash
npm run dev
```

The system will initialize all semantic tools asynchronously and begin serving over `stdio` for standard MCP client integration.

## 📄 Documentation

- [Project Guide](GUIDE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## 📜 License

This project is licensed under the [MIT License](LICENSE).
