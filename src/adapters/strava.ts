import { QueryTranslator } from '../core/query.js';
import type { PlatformFilterMap, SemanticQuery } from '../core/query.js';
import { TokenCompressionLayer } from '../core/compression.js';
import { logger } from '../utils/logger.js';
import type { SemanticTool } from '../core/server.js';

interface StravaSemanticQuery extends SemanticQuery {
    insight_type?: string; // e.g., 'performance_trend', 'injury_risk', 'declining_pace'
}

export const StravaQueryMap: PlatformFilterMap = {
    timeframe: {
        name: 'after',
        valueMapper: (val) => {
            // Typically Unix Epoch timestamps, mocking simplified strings
            if (val === 'last_30_days') return Math.floor(Date.now() / 1000) - 30 * 86400;
            return Math.floor(Date.now() / 1000) - 7 * 86400;
        }
    }
};

/**
 * Strava Adapter
 */
export class StravaAdapter {
    private static mockRuns = [
        { id: 'STRV-1', name: 'Morning Run', distance_km: 10, pace_min_km: 5.5, heart_rate_avg: 155, date: '2023-10-27' },
        { id: 'STRV-2', name: 'Long Weekend Run', distance_km: 21, pace_min_km: 5.8, heart_rate_avg: 160, date: '2023-10-25' },
        { id: 'STRV-3', name: 'Recovery Jog', distance_km: 5, pace_min_km: 6.5, heart_rate_avg: 135, date: '2023-10-24' },
        { id: 'STRV-4', name: 'Tempo Run', distance_km: 8, pace_min_km: 5.0, heart_rate_avg: 175, date: '2023-10-22' },
        { id: 'STRV-5', name: 'Tired Run', distance_km: 5, pace_min_km: 6.8, heart_rate_avg: 165, date: '2023-10-21' }, // High HR, low pace => risk
    ];

    static async fetchPhysicalInsights(query: StravaSemanticQuery): Promise<any[]> {
        const apiParams = QueryTranslator.translateToAPIParams(query, StravaQueryMap);
        logger.info(`[StravaAdapter] Simulated Fetch with params: ${JSON.stringify(apiParams)}`);

        return this.mockRuns.filter(run => {
            if (query.insight_type === 'injury_risk') {
                // Basic heuristic: if easy pace but unusually high HR
                return run.pace_min_km > 6.0 && run.heart_rate_avg > 160;
            }
            if (query.insight_type === 'declining_pace') {
                // Basic heuristic: pacing worse than 6.0 min/km
                return run.pace_min_km > 6.0;
            }
            if (query.insight_type === 'longest_effort') {
                return run.distance_km > 15;
            }
            return true;
        });
    }

    static normalize(rawRun: any) {
        return {
            id: rawRun.id,
            title: rawRun.name,
            date: rawRun.date,
            distance_km: rawRun.distance_km,
            pace: `${rawRun.pace_min_km} min/km`,
            hr_avg: rawRun.heart_rate_avg
        };
    }

    static registerSemanticTools(): SemanticTool[] {
        return [
            {
                name: 'strava_get_injury_risk_pattern',
                description: 'Semantic insight tool. Infers physical exhaustion or injury risk by analyzing high-heart-rate but slow-pace workouts.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const query: StravaSemanticQuery = { intent: 'get_workouts', insight_type: 'injury_risk' };
                    const insights = await this.fetchPhysicalInsights(query);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(insights.map(t => this.normalize(t))),
                        'High Exhaustion/Injury Risk Run'
                    );
                }
            },
            {
                name: 'strava_get_longest_effort_last_30_days',
                description: 'Returns the longest endurance effort over the last 30 days.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const query: StravaSemanticQuery = { intent: 'get_workouts', insight_type: 'longest_effort', timeframe: 'last_30_days' };
                    const insights = await this.fetchPhysicalInsights(query);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(insights.map(t => this.normalize(t))),
                        'Long Endurance Effort'
                    );
                }
            },
            {
                name: 'strava_get_declining_pace_runs',
                description: 'Retrieves recent runs where pace has dropped indicating potential overtraining.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const query: StravaSemanticQuery = { intent: 'get_workouts', insight_type: 'declining_pace' };
                    const insights = await this.fetchPhysicalInsights(query);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(insights.map(t => this.normalize(t))),
                        'Declining Pace Run'
                    );
                }
            }
        ];
    }
}
