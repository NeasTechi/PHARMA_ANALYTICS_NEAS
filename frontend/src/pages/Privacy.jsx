import { Helmet } from 'react-helmet-async'

export default function Privacy() {
    return (
        <div className="space-y-6 animate-slide-up">
            <Helmet>
                <title>Privacy Policy · Pharma Analytics</title>
                <meta name="description" content="Privacy policy for Pharma Analytics dashboard." />
            </Helmet>
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="card p-6 prose prose-sm dark:prose-invert max-w-none space-y-4 text-sm leading-relaxed">
                <section>
                    <h2 className="text-lg font-bold">1. Data We Collect</h2>
                    <p>This dashboard displays pharma sales data stored in your Supabase project. We do not collect personal data beyond what you provide (e.g., admin email for authentication).</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold">2. How We Use Data</h2>
                    <p>Sales data is used solely to generate analytics, charts, and AI insights within this dashboard. No data is sold or shared with third parties.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold">3. AI Processing</h2>
                    <p>When you use AI features, aggregated sales summaries (not raw PII) are sent to Groq's API for processing. Groq's privacy policy applies to that data.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold">4. Cookies & Local Storage</h2>
                    <p>We use local storage for theme preference and session tokens. No tracking cookies are used.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold">5. Your Rights</h2>
                    <p>You can request deletion of your data at any time by contacting the administrator. Admins can delete records via the Data Management page.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold">6. Security</h2>
                    <p>Data is transmitted over HTTPS. Access is controlled via Supabase Row Level Security (RLS). Only authenticated admins can modify data.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold">7. Contact</h2>
                    <p>For privacy questions, contact the project owner via GitHub: <a href="https://github.com/NeasTechi" className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">NeasTechi</a>.</p>
                </section>
            </div>
        </div>
    )
}