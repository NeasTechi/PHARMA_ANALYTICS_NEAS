import { useSalesData } from '../hooks/useSalesData'
import AdminPanel from '../components/AdminPanel'
import Login from './Login'
import { Helmet } from 'react-helmet-async'

export default function DataManagement({ session, onAuth }) {
    const { products, loading, error, refresh } = useSalesData()
    if (loading) return <div className="text-gray-500">Loading...</div>
    if (error) return <div className="card p-8 text-center"><p className="text-red-500 mb-3">Error: {error}</p><button onClick={refresh} className="btn-primary">Retry</button></div>

    if (!session) {
        return (
            <div className="space-y-6">
                <Helmet><title>Data Management · Pharma Analytics</title></Helmet>
                <div>
                    <h2 className="text-2xl font-bold">Data Management</h2>
                    <p className="text-gray-500 text-sm">Admin access required</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <p className="mb-4 text-gray-600 dark:text-gray-300">Sign in with an admin account to add or remove sales records.</p>
                    <Login session={session} onAuth={onAuth} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Helmet><title>Data Management · Pharma Analytics</title></Helmet>
            <div>
                <h2 className="text-2xl font-bold">Data Management</h2>
                <p className="text-gray-500 text-sm">Add or remove sales records (admin)</p>
            </div>
            <AdminPanel products={products} onRefresh={refresh} />
        </div>
    )
}