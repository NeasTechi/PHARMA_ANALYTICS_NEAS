/// <reference lib="deno.ns" />

const GROQ_KEY = Deno.env.get('GROQ_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (!GROQ_KEY) {
        return json({ error: 'GROQ_API_KEY not configured' }, 500)
    }

    let body: any
    try {
        body = await req.json()
    } catch {
        return json({ error: 'Invalid JSON body' }, 400)
    }

    const mode = body?.mode === 'explain' ? 'explain' : 'ask'

    const system = mode === 'ask'
        ? 'You are a pharma analytics assistant. Answer using the provided summary. Be concise.'
        : 'You are a pharma sales analyst.'

    const userContent = mode === 'explain'
        ? `You are a pharma sales analyst. Explain what changed, why it might matter, and suggest actions. Keep it concise (bullet points).\n\nSummary: ${JSON.stringify(body?.summary ?? {})}\nAnomalies: ${JSON.stringify(body?.anomalies ?? [])}`
        : `Summary: ${JSON.stringify(body?.summary ?? {})}\n\nQuestion: ${body?.question ?? ''}`

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
            return json({ error: t }, res.status)
        }

        const data = await res.json()
        const result = data?.choices?.[0]?.message?.content || 'No response.'
        return json({ result })
    } catch (err) {
        return json({ error: String(err) }, 500)
    }
})