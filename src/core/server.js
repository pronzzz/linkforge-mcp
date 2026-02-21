import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
import { LinkForgeError } from '../utils/errors.js';
export class LinkForgeServer {
    server;
    tools = new Map();
    constructor(serverName, serverVersion) {
        this.server = new Server({
            name: serverName,
            version: serverVersion,
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => logger.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.close();
            process.exit(0);
        });
    }
    registerTool(tool) {
        if (this.tools.has(tool.name)) {
            logger.warn(`Tool ${tool.name} is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
        logger.info(`Registered tool: ${tool.name}`);
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: Array.from(this.tools.values()).map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                })),
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const tool = this.tools.get(name);
            if (!tool) {
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
            try {
                const result = await tool.handler(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                logger.error(`Error executing tool ${name}`, error);
                if (error instanceof LinkForgeError) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${error.message} (Code: ${error.statusCode})`
                            }
                        ],
                        isError: true,
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Internal error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        logger.info('LinkForge MCP server running on stdio');
    }
    async close() {
        await this.server.close();
    }
}
//# sourceMappingURL=server.js.map