/**
 * TokenCompressionLayer
 *
 * Compresses raw SaaS API payloads into minimal, AI-ready representations.
 * Drops nulls/empties, truncates lists, and extracts only semantic value.
 */
export class TokenCompressionLayer {
    /**
     * Compress an array of objects
     */
    static compressList(data, options = {}) {
        const maxItems = options.maxItems || 20;
        // Sort logic could go here depending on context, assuming pre-sorted by adapter
        const truncated = data.slice(0, maxItems);
        return truncated.map(item => this.compressObject(item, options));
    }
    /**
     * Compress a single object by dropping nulls and reducing verbosity
     */
    static compressObject(data, options = {}) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        const compressed = {};
        for (const [key, value] of Object.entries(data)) {
            // Drop explicitly requested or logically empty items
            if (options.dropEmpty !== false && (value === null || value === undefined || value === '')) {
                continue;
            }
            // If the value is an object, recurse
            if (typeof value === 'object' && !Array.isArray(value)) {
                const nested = this.compressObject(value, options);
                if (Object.keys(nested).length > 0)
                    compressed[key] = nested;
            }
            // If array, compress elements
            else if (Array.isArray(value)) {
                if (value.length > 0) {
                    compressed[key] = value.map(v => typeof v === 'object' ? this.compressObject(v, options) : v);
                }
            }
            else {
                // Simple primitive
                compressed[key] = value;
            }
        }
        return compressed;
    }
    /**
     * Helper to format a semantic summary directly into a string, bypassing JSON token overhead
     */
    static formatSemanticSummary(items, type) {
        if (items.length === 0)
            return `No ${type}s found.`;
        // E.g. "Found 5 Tasks. \n - Task 1 (High Priority)\n - Task 2"
        let summary = `Found ${items.length} ${type}s:\n`;
        items.forEach(item => {
            summary += `- ${item.title || item.name || item.id}`;
            const badges = [];
            if (item.priority)
                badges.push(`P${item.priority}`);
            if (item.status)
                badges.push(item.status);
            if (badges.length > 0)
                summary += ` [${badges.join(', ')}]`;
            summary += '\n';
        });
        return summary;
    }
}
//# sourceMappingURL=compression.js.map