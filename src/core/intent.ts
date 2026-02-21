import type { SemanticQuery } from './query.js';

export class IntentClassifier {
    /**
     * Helper function to detect urgent/high priority intents from raw arguments.
     * This mimics an AI's internal pre-filtering logic before making the API call.
     */
    static classifyPriority(args: any): string | undefined {
        if (args.isUrgent || args.isImportant || args.priority === 'high' || args.priority === 'urgent') {
            return 'high';
        }
        return undefined;
    }

    /**
     * Helper function to detect timeframe intents.
     */
    static classifyTimeframe(args: any): string | undefined {
        if (args.dueToday || args.timeframe === 'today') return 'today';
        if (args.timeframe === 'upcoming' || args.isUpcoming) return 'upcoming';
        if (args.overdue || args.timeframe === 'overdue') return 'overdue';
        return undefined;
    }

    /**
     * Translates a typical raw, unstructured request from the AI into a structured SemanticQuery.
     */
    static parse(intent: string, args: any): SemanticQuery {
        const query: SemanticQuery = {
            intent,
            limit: args.limit || 20, // Default to token-efficient limits
        };

        const priority = this.classifyPriority(args);
        if (priority !== undefined) query.priority = priority;

        const timeframe = this.classifyTimeframe(args);
        if (timeframe !== undefined) query.timeframe = timeframe;

        if (args.status !== undefined) query.status = args.status;
        if (args.customFilters !== undefined) query.customFilters = args.customFilters;

        return query;
    };
}
