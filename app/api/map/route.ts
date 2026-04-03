import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { redis } from '../../../lib/redis';

export async function GET() {
  try {
    // 1. FAST PATH: Check Redis Cache for the merged datasets
    if (redis) {
      try {
        const cachedPayload = await redis.get('map:geojson:payload:v2');
        if (cachedPayload) {
          // Send raw buffered JS payload directly bypassing disk entirely
          return new NextResponse(cachedPayload, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400',
            }
          });
        }
      } catch (redisError) {
        console.warn("Redis is unreachable or misconfigured, falling back to disk", redisError);
      }
    }

    // 2. CACHE MISS / NO REDIS: Read physically from Disk
    const publicDir = path.join(process.cwd(), 'public');
    const indiaBuf = await fs.readFile(path.join(publicDir, 'indian_states.geojson'));
    const worldBuf = await fs.readFile(path.join(publicDir, 'neighbours.geojson'));
    
    // Combine both payloads into a single response
    const payload = {
      indiaMap: JSON.parse(indiaBuf.toString()),
      worldMap: JSON.parse(worldBuf.toString())
    };

    // 3. CACHE SAVING: Store in Redis for 24 Hours if connection exists
    if (redis) {
      try {
        await redis.setex('map:geojson:payload:v2', 86400, JSON.stringify(payload));
      } catch (redisSetErr) {
        console.warn("Failed to set cache block in Redis", redisSetErr);
      }
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400',
      }
    });

  } catch (error) {
    console.error("Map Data Aggregation Error:", error);
    return NextResponse.json({ error: 'Failed to aggregate Map Data' }, { status: 500 });
  }
}
