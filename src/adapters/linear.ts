import { QueryTranslator } from '../core/query.js';
import type { PlatformFilterMap, SemanticQuery } from '../core/query.js';
import { TokenCompressionLayer } from '../core/compression.js';
import { logger } from '../utils/logger.js';
import type { SemanticTool } from '../core/server.js';

// Define how Semantic keys map to Linear GraphQL variables/filters
export const LinearQueryMap: PlatformFilterMap = {
    status: {
        name: 'state',
        valueMapper: (val) => {
            // rough mapping to linear states
            if (val === 'blocked' || val === 'stalled') return 'Blocked';
            if (val === 'completed') return 'Done';
            return 'Todo';
        }
    },
    priority: {
        name: 'priority',
        valueMapper: (val) => {
            // Linear priorities: 1 = urgent, 2 = high, 3 = normal, 4 = low (standard config)
            if (val === 'urgent') return 1;
            if (val === 'high') return 2;
            return 3;
        }
    }
};

/**
 * Linear Adapter
 * Simulates a GraphQL based adapter for pulling specific issue context.
 */
export class LinearAdapter {
    private static mockIssues = [
        { id: 'LIN-101', title: 'Implement OAuth', priority: 1, state: { name: 'Blocked' }, assignee: null },
        { id: 'LIN-102', title: 'Fix CSS bug', priority: 3, state: { name: 'In Progress' }, assignee: { name: 'Alice' } },
        { id: 'LIN-103', title: 'Update dependencies', priority: 2, state: { name: 'Todo' }, assignee: null },
        { id: 'LIN-104', title: 'Write documentation', priority: 4, state: { name: 'Done' }, assignee: { name: 'Bob' } },
    ];

    /**
     * Simulates a Linear GraphQL fetch.
     */
    static async fetchIssues(query: SemanticQuery): Promise<any[]> {
        const apiParams = QueryTranslator.translateToAPIParams(query, LinearQueryMap);
        logger.info(`[LinearAdapter] Simulated Fetch with params: ${JSON.stringify(apiParams)}`);

        // Mock filtering logic based on the params
        return this.mockIssues.filter(issue => {
            if (apiParams.priority && issue.priority > apiParams.priority) return false;
            if (apiParams.state && issue.state.name !== apiParams.state) return false;
            if (apiParams.assignee === 'unassigned' && issue.assignee !== null) return false;
            return true;
        });
    }

    /**
     * Normalizes raw Linear Issue payload to LinkForge uniform Schema 
     */
    static normalize(rawIssue: any) {
        return {
            id: rawIssue.id,
            title: rawIssue.title,
            urgency: rawIssue.priority, // already 1-4
            status: rawIssue.state.name,
            assignee: rawIssue.assignee ? rawIssue.assignee.name : 'Unassigned'
        };
    }

    /**
     * Registers the predefined, token-optimized Semantic Tools into the server.
     */
    static registerSemanticTools(): SemanticTool[] {
        return [
            {
                name: 'linear_get_blocked_high_priority_issues',
                description: 'Semantic intent tool. Returns strictly blocked, high-priority issues.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const semanticQuery: SemanticQuery = {
                        intent: 'get_issues',
                        status: 'blocked',
                        priority: 'urgent',
                    };

                    const rawIssues = await this.fetchIssues(semanticQuery);
                    const normalized = rawIssues.map(t => this.normalize(t));

                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(normalized),
                        'Blocked High-Priority Issue'
                    );
                }
            },
            {
                name: 'linear_get_unassigned_urgent_issues',
                description: 'Returns urgently prioritized tickets that have no owner.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const semanticQuery: SemanticQuery = {
                        intent: 'get_issues',
                        priority: 'urgent',
                        customFilters: { assignee: 'unassigned' }
                    };

                    const rawIssues = await this.fetchIssues(semanticQuery);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(rawIssues.map(t => this.normalize(t))),
                        'Unassigned Urgent Issue'
                    );
                }
            }
        ];
    }
}
