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
                const params = new URLSearchParams(window.location.search)
                const code = params.get('code')
                const isExtension = params.get('extension') === 'true'

                // Try code exchange first (PKCE flow)
                if (code) {
                    console.log('Exchanging code for session...')
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

                    if (error) {
                        console.error('Error exchanging code:', error)
                        console.error('Error details:', JSON.stringify(error, null, 2))

                        // Try to get session anyway (might already be set)
                        const { data: { session } } = await supabase.auth.getSession()
                        if (!session) {
                            router.push('/auth?error=auth_callback_error')
                            return
                        }
                    }
                }

                // Check for hash fragments (implicit flow fallback)
                const hash = window.location.hash.substring(1)
                if (hash) {
                    const hashParams = new URLSearchParams(hash)
                    const accessToken = hashParams.get('access_token')

                    if (accessToken) {
                        console.log('Found access token in hash, setting session...')
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: hashParams.get('refresh_token') || ''
                        })

                        if (error) {
                            console.error('Error setting session from hash:', error)
                        }
                    }
                }

                // Verify we have a session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError || !session) {
                    console.error('No session found after callback:', sessionError)
                    router.push('/auth')
                    return
                }

                console.log('Session established successfully for:', session.user.email)

                // Sync to extension storage
                if (session && session.user) {
                    const authData = {
                        access_token: session.access_token,
                        refresh_token: session.refresh_token,
                        user: session.user,
                        timestamp: Date.now()
                    }

                    localStorage.setItem('ankify_extension_sync', JSON.stringify(authData))
                    console.log('Auth synced to localStorage for extension')
                }

                // If this was from extension, show success message briefly
                if (isExtension) {
                    // Wait a moment for content script to sync
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }

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
