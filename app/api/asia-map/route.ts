import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { redis } from '../../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. FAST PATH: Check Redis Cache
    if (redis) {
      try {
        const cachedPayload = await redis.get('map:asia:geojson:payload:v3');
        if (cachedPayload) {
          return new NextResponse(cachedPayload, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400',
            }
          });
        }
      } catch (redisError) {
        console.warn('Redis unreachable for Asia map, falling back to disk', redisError);
      }
    }

    // 2. CACHE MISS: Read from Disk
    const publicDir = path.join(process.cwd(), 'public');
    const asiaBuf = await fs.readFile(path.join(publicDir, 'asia_countries.geojson'));
    const bgBuf = await fs.readFile(path.join(publicDir, 'asia_background.geojson'));

    const payload = {
      asiaMap: JSON.parse(asiaBuf.toString()),
      worldBg: JSON.parse(bgBuf.toString()),
    };

    // 3. Store in Redis for 24 hours
    if (redis) {
      try {
        await redis.setex('map:asia:geojson:payload:v3', 86400, JSON.stringify(payload));
      } catch (redisSetErr) {
        console.warn('Failed to cache Asia map in Redis', redisSetErr);
      }
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400',
      }
    });

  } catch (error) {
    console.error('Asia Map Data Aggregation Error:', error);
    return NextResponse.json({ error: 'Failed to aggregate Asia Map Data' }, { status: 500 });
  }
}
