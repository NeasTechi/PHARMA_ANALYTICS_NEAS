import { supabase } from './supabaseClient'

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
}

export function onAuthChange(cb) {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
    return () => sub.subscription.unsubscribe()
}