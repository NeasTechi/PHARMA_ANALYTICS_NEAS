import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (!OPENAI_KEY) {
        return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    try {
        const body = await req.json()
        const mode = body.mode || 'explain'
        let userContent = ''

        if (mode === 'explain') {
            userContent = `You are a pharma sales analyst. Explain what changed, why it might matter, and suggest actions. Keep it concise (bullet points).\n\nSummary: ${JSON.stringify(body.summary)}\nAnomalies: ${JSON.stringify(body.anomalies)}`
        } else {
            userContent = `Summary: ${JSON.stringify(body.summary)}\n\nQuestion: ${body.question}`
        }

        const system = mode === 'ask'
            ? 'You are a pharma analytics assistant. Answer using the provided summary. Be concise.'
            : 'You are a pharma sales analyst.'

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: userContent },
                ],
                temperature: 0.4,
            }),
        })

        if (!res.ok) {
            const t = await res.text()
            return new Response(JSON.stringify({ error: t }), {
                status: res.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const data = await res.json()
        const result = data.choices?.[0]?.message?.content || 'No response.'
        return new Response(JSON.stringify({ result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})