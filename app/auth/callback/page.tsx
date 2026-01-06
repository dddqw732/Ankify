'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the code from URL params
                const params = new URLSearchParams(window.location.search)
                const code = params.get('code')

                if (code) {
                    // Exchange code for session
                    const { error } = await supabase.auth.exchangeCodeForSession(code)

                    if (error) {
                        console.error('Error exchanging code:', error)
                        router.push('/auth?error=auth_callback_error')
                        return
                    }
                }

                // Check if we have a session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError || !session) {
                    console.error('No session found:', sessionError)
                    router.push('/auth')
                    return
                }

                // Successfully authenticated, redirect to dashboard
                router.push('/dashboard')
            } catch (error) {
                console.error('Callback error:', error)
                router.push('/auth?error=unknown_error')
            }
        }

        handleCallback()
    }, [router, supabase.auth])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
                <p className="text-white text-lg">Completing sign in...</p>
            </div>
        </div>
    )
}
