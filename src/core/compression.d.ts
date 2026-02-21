export interface CompressionOptions {
    maxItems?: number;
    summarizeKeys?: string[];
    dropEmpty?: boolean;
}
/**
 * TokenCompressionLayer
 *
 * Compresses raw SaaS API payloads into minimal, AI-ready representations.
 * Drops nulls/empties, truncates lists, and extracts only semantic value.
 */
export declare class TokenCompressionLayer {
    /**
     * Compress an array of objects
     */
    static compressList(data: any[], options?: CompressionOptions): any[];
    /**
     * Compress a single object by dropping nulls and reducing verbosity
     */
    static compressObject(data: any, options?: CompressionOptions): any;
    /**
     * Helper to format a semantic summary directly into a string, bypassing JSON token overhead
     */
    static formatSemanticSummary(items: any[], type: string): string;
}
//# sourceMappingURL=compression.d.ts.map