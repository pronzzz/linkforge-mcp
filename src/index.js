import { LinkForgeServer } from './core/server.js';
import { TokenCompressionLayer } from './core/compression.js';
import { logger } from './utils/logger.js';
// Setup basic server
const server = new LinkForgeServer('linkforge-mcp', '1.0.0');
// Example Diagnostic/Diagnostic semantic tool
server.registerTool({
    name: 'get_server_health_summary',
    description: 'Returns a semantic, token-compressed summary of the LinkForge MCP server health.',
    inputSchema: {
        type: 'object',
        properties: {},
    },
    handler: async () => {
        logger.info('Handling get_server_health_summary');
        const rawMetrics = {
            status: 'healthy',
            uptime_seconds: process.uptime(),
            memory_usage: process.memoryUsage(),
            active_adapters: [],
            error_rates: {
                'last_hour': 0,
                'last_day': 0
            },
            metadata: {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            }
        };
        // Compress payload to drop irrelevant/empty info
        const compressed = TokenCompressionLayer.compressObject(rawMetrics, { dropEmpty: true });
        // Convert to a semantic summary string for optimal token usage
        return `Server Status: ${compressed.status} | Uptime: ${Math.round(compressed.uptime_seconds)}s | Environment: ${compressed.metadata?.environment}\nMemory RSS: ${Math.round(compressed.memory_usage?.rss / 1024 / 1024)}MB`;
    }
});
// Start Server
server.run().catch((error) => {
    logger.error('Failed to start LinkForge MCP Server', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map