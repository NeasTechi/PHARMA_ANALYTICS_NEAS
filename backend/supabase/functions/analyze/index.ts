/// <reference lib="deno.ns" />

const GROQ_KEY = Deno.env.get('GROQ_API_KEY')
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*'

// Simple in-memory rate limiter (per IP, 20 requests / minute)
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

function corsHeaders(origin: string | null) {
    const allowed = ALLOWED_ORIGIN === '*' ? '*' : (origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN)
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
}

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = rateMap.get(ip)
    if (!entry || now > entry.reset) {
        rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
        return true
    }
    if (entry.count >= RATE_LIMIT) return false
    entry.count++
    return true
}

function json(body: unknown, status = 200, origin: string | null = null) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    })
}

Deno.serve(async (req) => {
    const origin = req.headers.get('origin')
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders(origin) })
    }

    if (req.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405, origin)
    }

    if (!checkRateLimit(ip)) {
        return json({ error: 'Too many requests. Please try again later.' }, 429, origin)
    }

    if (!GROQ_KEY) {
        return json({ error: 'GROQ_API_KEY not configured' }, 500, origin)
    }

    let body: any
    try {
        body = await req.json()
    } catch {
        return json({ error: 'Invalid JSON body' }, 400, origin)
    }

    // Basic input validation / sanitization
    const mode = body?.mode === 'explain' ? 'explain' : 'ask'
    const question = typeof body?.question === 'string' ? body.question.slice(0, 500) : ''
    const summary = body?.summary && typeof body.summary === 'object' ? body.summary : {}
    const anomalies = Array.isArray(body?.anomalies) ? body.anomalies.slice(0, 50) : []

    const system = mode === 'ask'
        ? 'You are a pharma analytics assistant. Answer using the provided summary. Be concise.'
        : 'You are a pharma sales analyst.'

    const userContent = mode === 'explain'
        ? `You are a pharma sales analyst. Explain what changed, why it might matter, and suggest actions. Keep it concise (bullet points).\n\nSummary: ${JSON.stringify(summary)}\nAnomalies: ${JSON.stringify(anomalies)}`
        : `Summary: ${JSON.stringify(summary)}\n\nQuestion: ${question}`

    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_KEY}`,
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: userContent },
                ],
                temperature: 0.4,
                max_tokens: 1024,
            }),
        })

        if (!res.ok) {
            const t = await res.text()
            return json({ error: t }, res.status, origin)
        }

        const data = await res.json()
        const result = data?.choices?.[0]?.message?.content || 'No response.'
        return json({ result }, 200, origin)
    } catch (err) {
        return json({ error: String(err) }, 500, origin)
    }
})