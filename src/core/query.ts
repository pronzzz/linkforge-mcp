export interface SemanticQuery {
    intent: string;         // e.g., 'get_tasks', 'get_events'
    timeframe?: string;     // e.g., 'today', 'last_week', 'upcoming'
    priority?: string;      // e.g., 'high', 'urgent'
    status?: string;        // e.g., 'blocked', 'completed', 'stalled'
    limit?: number;         // e.g., 5, 20
    customFilters?: Record<string, string>;
}

export interface PlatformFilterMap {
    [semanticKey: string]: {
        name: string;        // API-specific filter name, e.g., 'due_date'
        valueMapper?: (val: string) => string | number; // Mapper for values, e.g., 'today' -> '2023-10-27'
    };
}

/**
 * Maps a standardized SemanticQuery into a platform-specific filter payload or URL search parameters.
 */
export class QueryTranslator {
    /**
     * Translates a SemanticQuery to a raw API query string or object using a provided map.
     */
    static translateToAPIParams(query: SemanticQuery, map: PlatformFilterMap): Record<string, any> {
        const params: Record<string, any> = {};

        for (const [key, value] of Object.entries(query)) {
            if (key === 'intent' || value === undefined) continue;

            // Handle well-known semantic keys
            if (map[key]) {
                const platformKey = map[key].name;
                const mapper = map[key].valueMapper;

                params[platformKey] = mapper ? mapper(value as string) : value;
            }
        }

        // Handle any custom explicit filters passed down
        if (query.customFilters) {
            for (const [customKey, customValue] of Object.entries(query.customFilters)) {
                params[customKey] = customValue;
            }
        }

        if (query.limit) {
            const limitMap = map['limit'];
            if (limitMap) {
                params[limitMap.name] = limitMap.valueMapper ? limitMap.valueMapper(query.limit.toString()) : query.limit;
            } else {
                // Fallback standard limit Param
                params['limit'] = query.limit;
            }
        }

        return params;
    }
}
