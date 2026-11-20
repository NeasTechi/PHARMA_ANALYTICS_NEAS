/// <reference lib="deno.ns" />

const GROQ_KEY = Deno.env.get('GROQ_API_KEY')
const DB_URL = Deno.env.get('SUPABASE_DB_URL')
// Comma- or space-separated list of allowed browser origins, e.g. "https://app.example.com"
// shortcut: defaults to "*" so an unset secret does not break the deployed app; set it to lock CORS down
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGIN') || '*').split(/[\s,]+/).filter(Boolean)

// Simple in-memory rate limiter (per IP, 20 requests / minute)
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000
const MAX_BODY_BYTES = 64 * 1024
const MAX_CONTEXT_CHARS = 4000
const MAX_ROWS = 200
const MAX_RESULT_CHARS = 8000
const MODEL = 'openai/gpt-oss-20b'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SCHEMA = `fact_sales(sales_key, date_key, product_key, customer_key, pharmacy_key, employee_key,
  supplier_key, payment_key, transaction_id, prescription_number, quantity_sold, unit_price,
  discount_amount, tax_amount, total_amount, cost_amount, profit_amount)
dim_date(date_key, full_date, day, month, month_name, quarter, year, day_of_week)
dim_product(product_key, product_name, category, strength, manufacturer)
dim_customer(customer_key, customer_id, customer_name, gender, date_of_birth, age_group, city, province)
dim_pharmacy(pharmacy_key, pharmacy_id, pharmacy_name, branch_name, city, province, region)
dim_employee(employee_key, employee_id, employee_name, position, license_number, hire_date)
dim_supplier(supplier_key, supplier_id, supplier_name, contact_person, phone, city, province)
dim_payment(payment_key, payment_method, payment_type, description)`

const SYSTEM = `You answer questions about a pharmacy sales database (PostgreSQL).
Use the run_sql tool to get numbers. Never invent data: if the answer depends on records, query first.
Rules:
- One SELECT or WITH statement. No semicolons, no writes.
- Join fact_sales to the dimensions on their *_key columns.
- pharmacy_name and customer_name on fact_sales are NULL; use dim_pharmacy and dim_customer.
- Results are capped at ${MAX_ROWS} rows, so aggregate with GROUP BY instead of listing raw rows.
- After the query, answer in 1-3 sentences with the actual numbers. Never show SQL.`

const TOOLS = [{
    type: 'function',
    function: {
        name: 'run_sql',
        description: 'Run a read-only PostgreSQL SELECT against the pharmacy analytics database.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'A single SELECT or WITH statement.' },
            },
            required: ['query'],
        },
    },
}]

// Anything that could write, change settings or reach non-public schemas.
const FORBIDDEN = /\b(insert|update|delete|drop|alter|create|grant|revoke|truncate|copy|vacuum|analyze|into|do|call|set|reset|comment|begin|commit|rollback|listen|notify|information_schema)\b|\bpg_|\b(auth|storage|vault)\./i

function corsHeaders(origin: string | null): Record<string, string> {
    const allowed = ALLOWED_ORIGINS.includes('*')
        ? '*'
        : origin && ALLOWED_ORIGINS.includes(origin)
            ? origin
            : ''
    const headers: Record<string, string> = {
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
    if (allowed) headers['Access-Control-Allow-Origin'] = allowed
    return headers
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

// Caps how much caller-supplied context can reach the model (token cost).
function clamp(value: unknown): string {
    if (value === undefined || value === null) return ''
    const s = typeof value === 'string' ? value : JSON.stringify(value)
    return s.length > MAX_CONTEXT_CHARS ? s.slice(0, MAX_CONTEXT_CHARS) : s
}

export function checkSql(raw: unknown): string {
    const sql = String(raw || '').trim().replace(/;\s*$/, '')
    if (!/^(select|with)\b/i.test(sql)) throw new Error('only SELECT queries are allowed')
    if (sql.includes(';')) throw new Error('one statement only')
    if (FORBIDDEN.test(sql)) throw new Error('query uses a forbidden keyword')
    return `select * from (${sql}) t limit ${MAX_ROWS}`
}

async function runSql(rawQuery: unknown): Promise<string> {
    if (!DB_URL) throw new Error('database not configured')
    const wrapped = checkSql(rawQuery)
    const postgres = (await import('npm:postgres@3')).default
    const sql = postgres(DB_URL, { prepare: false, max: 1, connect_timeout: 10, idle_timeout: 5 })
    try {
        const rows = await sql.begin('read only', async (tx) => {
            await tx.unsafe("set local statement_timeout = '5000'")
            return await tx.unsafe(wrapped)
        })
        const text = JSON.stringify(rows, (_k, v) => (typeof v === 'bigint' ? Number(v) : v))
        return text.length > MAX_RESULT_CHARS ? `${text.slice(0, MAX_RESULT_CHARS)}...(truncated)` : text
    } finally {
        await sql.end({ timeout: 1 })
    }
}

async function groq(body: Record<string, unknown>) {
    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: MODEL, temperature: 0.2, max_tokens: 1024, ...body }),
        signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) throw new Error(await res.text())
    return await res.json()
}

async function ask(question: string, summary: string): Promise<string> {
    if (!question.trim()) return 'Please ask a question about the data.'

    const messages: any[] = [
        { role: 'system', content: `${SYSTEM}\n\nSchema:\n${SCHEMA}` },
        { role: 'user', content: `Question: ${question}\n\nSummary of fact_sales: ${summary}` },
    ]

    for (let round = 0; round < 3; round++) {
        const msg = (await groq({ messages, tools: TOOLS, tool_choice: 'auto' }))?.choices?.[0]?.message
        if (!msg) throw new Error('No response from the model')
        messages.push(msg)

        if (!Array.isArray(msg.tool_calls) || msg.tool_calls.length === 0) {
            return msg.content || 'No answer.'
        }
        for (const call of msg.tool_calls) {
            let content: string
            try {
                const args = JSON.parse(call?.function?.arguments || '{}')
                content = await runSql(args.query)
            } catch (err) {
                content = `ERROR: ${err instanceof Error ? err.message : String(err)}`
            }
            messages.push({ role: 'tool', tool_call_id: call.id, content })
        }
    }

    messages.push({ role: 'user', content: 'Answer now from the query results above. Do not call more tools.' })
    const final = (await groq({ messages }))?.choices?.[0]?.message
    return final?.content || 'No answer.'
}

async function explain(summary: string, anomalies: string): Promise<string> {
    const msg = (await groq({
        messages: [
            { role: 'system', content: 'You are a pharma sales analyst.' },
            {
                role: 'user',
                content: `Explain what changed, why it might matter, and suggest actions. Keep it concise (bullet points).\n\nSummary: ${summary}\nAnomalies: ${anomalies}`,
            },
        ],
    }))?.choices?.[0]?.message
    return msg?.content || 'No explanation returned.'
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

    if (Number(req.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
        return json({ error: 'Request too large' }, 413, origin)
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
    const summary = clamp(body?.summary ?? {})
    const anomalies = clamp(Array.isArray(body?.anomalies) ? body.anomalies.slice(0, 50) : [])

    try {
        const result = mode === 'explain'
            ? await explain(summary, anomalies)
            : await ask(question, summary)
        return json({ result }, 200, origin)
    } catch (err) {
        return json({ error: String(err) }, 500, origin)
    }
})
