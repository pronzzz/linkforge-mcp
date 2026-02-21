# LinkForge MCP - Developer Guide

Welcome to the LinkForge MCP developer guide. This document explains how the system is structured and providing tutorials on creating your own adapters.

## Core Philosophy: Semantic Tooling over CRUD

The fundamental principle of LinkForge MCP is to provide LLMs with **insights and answers, not raw data**.

When an AI asks "What should I work on today?", a traditional CRUD API responds with 100 tasks containing pagination keys, timestamps, UUIDs, and metadata fields. The AI must process this massive payload (consuming tokens) just to extract the title of the top priority task.

LinkForge instead executes the logic on the server and returns a `TokenCompressionLayer` compressed string that is simple, formatted, and ready for immediate LLM context consumption.

---

## Adding a New SaaS Adapter

Adapters live in `src/adapters/` and represent distinct integrations (e.g., GitHub, Slack, Notion).

### Step 1: Create the Adapter File

Create `src/adapters/github.ts`:

```typescript
import { LinkForgeServer, SemanticTool } from '../core/server.js';
import { z } from 'zod';
import { TokenCompressionLayer } from '../core/compression.js';
// import { QueryTranslator } from '../core/query.js'; 

export function setupGitHubAdapter(server: LinkForgeServer) {
    const getStaleHighPriorityPRs: SemanticTool = {
        name: 'github_get_stale_high_priority_prs',
        description: 'Retrieves highly important pull requests that have not been reviewed in over 3 days.',
        inputSchema: {
            type: 'object',
            properties: {
                repo: { type: 'string', description: 'The repository name (e.g., facebook/react)' }
            },
            required: ['repo']
        },
        handler: async (args: any) => {
            // 1. Fetch raw data using your standard fetch/axios approach
            // const rawData = await fetchGitHubPRs(args.repo);
            
            // For mock purposes: 
            const mockPRs = [
                { id: 1024, title: "Fix core memory leak in auth provider", status: "open", labels: ["P0", "bug"], last_updated: "2026-02-15T00:00:00Z" },
                { id: 1025, title: "Update README typos", status: "open", labels: ["documentation"], last_updated: "2026-02-20T00:00:00Z" }
            ];

            // 2. Perform the semantic filtering locally (simulating query engine intent)
            const stalePRs = mockPRs.filter(pr => pr.labels.includes("P0")); 

            // 3. Compress the response before sending it back
            return stalePRs.map(pr => 
                TokenCompressionLayer.compressObject(pr, ['title', 'labels', 'status'])
            ).join('\n---\n');
        }
    };

    // Register all tools
    server.registerTool(getStaleHighPriorityPRs);
}
```

### Step 2: Register the Adapter in `index.ts`

Import and call your setup function in `src/index.ts`:

```typescript
// ... existing imports
import { setupGitHubAdapter } from './adapters/github.js';

async function main() {
    const server = new LinkForgeServer("LinkForge", "1.0.0");
    
    // Setup Adapters
    setupTodoistAdapter(server);
    // ...
    setupGitHubAdapter(server); // <-- Register your new adapter here

    await server.run();
}
```

## Creating Custom Compressors

If your data source has specific shapes that don't compress well with the default `TokenCompressionLayer`, you can implement custom logic or string templates in your tool handler.

```typescript
// Inside your handler:
const metrics = await getSystemMetrics();
// Instead of TokenCompressionLayer you can use a direct string template:
return `CPU: ${metrics.cpu}%\nRAM: ${metrics.ram}GB\nStatus: ${metrics.isHealthy ? 'Healthy' : 'Critical'}`;
```

## Security and Rate Limiting

By default, the `LinkForgeServer` enforces a rate limit to prevent LLM loops.
`SecurityGuard.enforceRateLimit(name, { maxRequests: 20, windowMs: 60000 });`

If a specific tool needs higher volume, you can modify the core server logic or add tool-level custom overrides using parameters in the `SemanticTool` interface.
