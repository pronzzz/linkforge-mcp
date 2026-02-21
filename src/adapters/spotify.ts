import { QueryTranslator } from '../core/query.js';
import type { PlatformFilterMap, SemanticQuery } from '../core/query.js';
import { TokenCompressionLayer } from '../core/compression.js';
import { logger } from '../utils/logger.js';
import type { SemanticTool } from '../core/server.js';

// Specific Spotify intents
interface SpotifySemanticQuery extends SemanticQuery {
    mood?: string;       // focus, low_energy, mood_shift
    playback_pattern?: string; // skipped, replayed
}

export const SpotifyQueryMap: PlatformFilterMap = {
    timeframe: {
        name: 'time_range',
        valueMapper: (val) => {
            if (val === 'last_week') return 'short_term'; // Spotify APIs typically use short/medium/long term
            if (val === 'today') return 'daily';
            return 'short_term';
        }
    }
};

/**
 * Spotify Adapter
 * Simulates analyzing playback patterns rather than just raw CRUD retrieval.
 */
export class SpotifyAdapter {
    private static mockHistory = [
        { trackId: 'SPOT-1', name: 'Ambient Focus 1', artist: 'Brian Eno', energy: 0.2, playCount: 5, skips: 0, lastPlayed: '2023-10-27T10:00:00Z' },
        { trackId: 'SPOT-2', name: 'Upbeat Pop', artist: 'Dua Lipa', energy: 0.9, playCount: 2, skips: 3, lastPlayed: '2023-10-27T11:00:00Z' },
        { trackId: 'SPOT-3', name: 'Lofi Beats', artist: 'ChilledCow', energy: 0.3, playCount: 15, skips: 1, lastPlayed: '2023-10-27T09:00:00Z' },
        { trackId: 'SPOT-4', name: 'Sad Song', artist: 'Adele', energy: 0.4, playCount: 1, skips: 2, lastPlayed: '2023-10-26T18:00:00Z' },
    ];

    static async fetchMusicInsights(query: SpotifySemanticQuery): Promise<any[]> {
        const apiParams = QueryTranslator.translateToAPIParams(query, SpotifyQueryMap);
        logger.info(`[SpotifyAdapter] Simulated Fetch with params: ${JSON.stringify(apiParams)}`);

        return this.mockHistory.filter(track => {
            // Semantic insight simulation
            if (query.playback_pattern === 'skipped' && track.skips < 2) return false;
            if (query.playback_pattern === 'replayed' && track.playCount < 5) return false;
            if (query.mood === 'focus' && track.energy > 0.5) return false;
            if (query.mood === 'low_energy' && track.energy > 0.4) return false;
            return true;
        });
    }

    static normalize(rawTrack: any) {
        return {
            id: rawTrack.trackId,
            title: rawTrack.name,
            artist: rawTrack.artist,
            behavior_insight: rawTrack.skips > 2 ? 'Frequently Skipped' : (rawTrack.playCount > 10 ? 'Heavy Rotation' : 'Normal')
        };
    }

    static registerSemanticTools(): SemanticTool[] {
        return [
            {
                name: 'spotify_get_recently_skipped_tracks',
                description: 'Semantic insight tool. Returns tracks the user has been consistently skipping, useful for curating out noise.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const query: SpotifySemanticQuery = { intent: 'get_music', playback_pattern: 'skipped' };
                    const insights = await this.fetchMusicInsights(query);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(insights.map(t => this.normalize(t))),
                        'Skipped Track'
                    );
                }
            },
            {
                name: 'spotify_get_most_replayed_tracks_last_week',
                description: 'Returns tracks on heavy rotation from the last 7 days.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const query: SpotifySemanticQuery = { intent: 'get_music', playback_pattern: 'replayed', timeframe: 'last_week' };
                    const insights = await this.fetchMusicInsights(query);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(insights.map(t => this.normalize(t))),
                        'Replayed Track'
                    );
                }
            },
            {
                name: 'spotify_get_focus_music_playlists',
                description: 'Retrieves low-energy, ambient tracks ideal for deep focus work.',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => {
                    const query: SpotifySemanticQuery = { intent: 'get_music', mood: 'focus' };
                    const insights = await this.fetchMusicInsights(query);
                    return TokenCompressionLayer.formatSemanticSummary(
                        TokenCompressionLayer.compressList(insights.map(t => this.normalize(t))),
                        'Focus Track'
                    );
                }
            }
        ];
    }
}
