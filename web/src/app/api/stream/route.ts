import { NextResponse } from 'next/server';

// In-memory rate limiting store (for demonstration purposes only)
// In production, use Redis or a similar external store.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // max requests per window

export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();

    let rateData = rateLimitStore.get(ip);

    if (!rateData || rateData.resetTime < now) {
        rateData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
        rateLimitStore.set(ip, rateData);
    } else {
        rateData.count++;
        if (rateData.count > MAX_REQUESTS) {
            return NextResponse.json(
                { error: 'Too Many Requests', message: 'Rate limit exceeded.' },
                { status: 429, headers: { 'Retry-After': Math.ceil((rateData.resetTime - now) / 1000).toString() } }
            );
        }
    }

    try {
        const payload = await request.json();

        // Very basic payload validation
        if (!payload || typeof payload !== 'object') {
            return NextResponse.json({ error: 'Bad Request', message: 'Invalid JSON payload.' }, { status: 400 });
        }

        if (!payload.action || typeof payload.action !== 'string') {
             return NextResponse.json({ error: 'Bad Request', message: 'Missing or invalid "action" field.' }, { status: 400 });
        }

        if (!payload.data || !Array.isArray(payload.data)) {
            return NextResponse.json({ error: 'Bad Request', message: 'Missing or invalid "data" array.' }, { status: 400 });
        }

        // Process stream
        console.log(`[Stream API] Processing action: ${payload.action}`);

        return NextResponse.json({
            success: true,
            message: `Stream processed for action: ${payload.action}`,
            receivedDataLength: payload.data.length
        });

    } catch (error) {
        console.error("Stream API Error:", error);
        return NextResponse.json({ error: 'Bad Request', message: 'Malformed JSON.' }, { status: 400 });
    }
}
