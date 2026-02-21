import { QueryTranslator } from '../core/query.js';
import type { PlatformFilterMap, SemanticQuery } from '../core/query.js';
import { TokenCompressionLayer } from '../core/compression.js';
import { logger } from '../utils/logger.js';
import type { SemanticTool } from '../core/server.js';

// Define how Semantic keys map to Todoist REST API sync/rest parameters
export const TodoistQueryMap: PlatformFilterMap = {
    timeframe: {
        name: 'filter',
        valueMapper: (val) => {
            switch (val) {
                case 'today': return 'today';
                case 'upcoming': return '7 days';
                case 'overdue': return 'overdue';
                default: return val;
            }
        }
    },
    priority: {
        name: 'priority',
        valueMapper: (val) => {
            // Todoist priorities: 4 = urgent, 3 = high, etc (reversed logic compared to general intuition)
            // Let's assume High/Urgent = P4 or P3
            if (val === 'high' || val === 'urgent') return 4;
            return 1;
        }
    }
};

/**
 * Todoist Adapter
 * Note: A real implementation would accept an API key and fetch `https://api.todoist.com/rest/v2/`.
 * Here, we demonstrate the architectural pattern and semantic filtering logic using mock datasets.
 */
export class TodoistAdapter {
    private static mockTasks = [
        { id: '1', content: 'Finish PRD', due: { date: '2023-10-25', is_recurring: false }, priority: 4, is_completed: false },
        { id: '2', content: 'Grocery shopping', due: null, priority: 1, is_completed: false },
        { id: '3', content: 'Fix critical server bug', due: { date: '2023-10-27' }, priority: 4, is_completed: false },
        { id: '4', content: 'Read email', due: { date: '2023-11-01' }, priority: 2, is_completed: true },
    ];

    /**
     * Translates a universal SemanticQuery into raw Todoist tasks, simulating an API call.
     */
    static async fetchTasks(query: SemanticQuery): Promise<any[]> {
        const apiParams = QueryTranslator.translateToAPIParams(query, TodoistQueryMap);
        logger.info(`[TodoistAdapter] Simulated Fetch with params: ${JSON.stringify(apiParams)}`);

        // In a real adapter:
        // const res = await fetch(`https://api.todoist.com/rest/v2/tasks?` + new URLSearchParams(apiParams as any));
        // return await res.json();

        // Mock filtering logic based on the params
        return this.mockTasks.filter(task => {
            if (apiParams.priority && task.priority < apiParams.priority) return false;
            // Mock overdue comparison (assuming today is 2023-10-27)
            if (apiParams.filter === 'overdue' && task.due && task.due.date && task.due.date < '2023-10-27') return true;

            // This simulates returning filtered tasks
            return true;
        });
    }

    /**
     * Normalizes raw Todoist Task payload to LinkForge uniform Schema 
     */
    static normalize(rawTask: any) {
        return {
            id: `todoist_${rawTask.id}`,
            title: rawTask.content,
            urgency: rawTask.priority, // 1-4 scale
            due_date: rawTask.due?.date,
            status: rawTask.is_completed ? 'completed' : 'pending'
        };
    }

    /**
     * Registers the predefined, token-optimized Semantic Tools into the server.
     */
    static registerSemanticTools(): SemanticTool[] {
        return [
            {
                name: 'todoist_get_overdue_high_priority_tasks',
                description: 'Semantic intent tool. Returns strictly overdue, high-priority incomplete tasks mapped to minimal AI view.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const semanticQuery: SemanticQuery = {
                        intent: 'get_tasks',
                        timeframe: 'overdue',
                        priority: 'urgent',
                        status: 'pending'
                    };

                    const rawTasks = await this.fetchTasks(semanticQuery);
                    const normalized = rawTasks.map(t => this.normalize(t));

                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(normalized),
                        'High-Priority Overdue Task'
                    );
                }
            },
            {
                name: 'todoist_get_tasks_due_today',
                description: 'Returns strictly tasks due today.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const semanticQuery: SemanticQuery = {
                        intent: 'get_tasks',
                        timeframe: 'today',
                        status: 'pending'
                    };

                    const rawTasks = await this.fetchTasks(semanticQuery);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(rawTasks.map(t => this.normalize(t))),
                        'Task Due Today'
                    );
                }
            }
        ];
    }
}
