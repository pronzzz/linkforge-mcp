export interface SemanticTool {
    name: string;
    description: string;
    inputSchema: any;
    handler: (args: any) => Promise<any>;
}
export declare class LinkForgeServer {
    private server;
    private tools;
    constructor(serverName: string, serverVersion: string);
    registerTool(tool: SemanticTool): void;
    private setupToolHandlers;
    run(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map