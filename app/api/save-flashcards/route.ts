import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { title, description, flashcards, userId } = await request.json()

    console.log('Save request received:', { title, flashcardsCount: flashcards?.length, userId })

    if (!title || !flashcards || !userId) {
      console.log('Missing required fields:', { title: !!title, flashcards: !!flashcards, userId: !!userId })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify environment variables
    // 1. Try Cookie Auth first (for web app usage)
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })
    let { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // 2. If no cookie session, try Bearer Token (for extension usage)
    if (!session) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1]

        // Create a fresh client for token validation
        // This avoids issues where createRouteHandlerClient implicitly looks at cookies
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const tokenClient = createClient(supabaseUrl, supabaseAnonKey)

        const { data: { user }, error: userError } = await tokenClient.auth.getUser(token)

        if (user && !userError) {
          session = { user } as any
          // We also need to use this client for DB operations to respect RLS
          // But wait, the standard client won't have the user context unless we set it.
          // Actually, we can just use the Service Key if we wanted to bypass RLS, BUT we want RLS.
          // So we should use the token to create a client that acts as the user.
          // createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } } })
          // Or just reuse the authenticated user for the inserts.
          // Let's stick to using the `supabase` client for inserts but we might need to set the session?
          // No, createRouteHandlerClient relies on cookies.
          // If we validated the user via token, we should probably use a client initialized with that token to perfom DB ops.
        } else {
          console.error('Token validation failed:', userError?.message);
        }
      }
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No active session found.' }, { status: 401 })
    }

    // Use a client with the user's token for DB operations if it was a bearer token login
    // If it was cookie login, `supabase` is already good.
    // If it was bearer token, `supabase` (createRouteHandlerClient) has no auth context.
    // So if bearer token was used, we need a client that sends that token.

    let dbClient = supabase;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      dbClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
    }

    console.log('Saving for user:', session.user.id)

    // Insert flashcard set
    const { data: flashcardSet, error: setError } = await dbClient
      .from('flashcard_sets')
      .insert({
        user_id: session.user.id,
        title,
        description,
      })
      .select()
      .single()

    if (setError) {
      console.error('Error creating flashcard set:', setError)
      console.error('Set error details:', JSON.stringify(setError, null, 2))
      return NextResponse.json(
        { error: 'Failed to create flashcard set: ' + setError.message },
        { status: 500 }
      )
    }

    console.log('Flashcard set created successfully:', flashcardSet)

    // Insert individual flashcards
    const flashcardData = flashcards.map((card: any) => ({
      set_id: flashcardSet.id,
      question: card.question,
      answer: card.answer,
    }))

    const { error: cardsError } = await dbClient
      .from('flashcards')
      .insert(flashcardData)

    if (cardsError) {
      console.error('Error creating flashcards:', cardsError)
      console.error('Cards error details:', JSON.stringify(cardsError, null, 2))
      // If flashcards fail to insert, clean up the set
      await dbClient.from('flashcard_sets').delete().eq('id', flashcardSet.id)

      return NextResponse.json(
        { error: 'Failed to create flashcards: ' + cardsError.message },
        { status: 500 }
      )
    }

    console.log('Flashcards saved successfully, count:', flashcardData.length)

    // Clear cache for dashboard
    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      setId: flashcardSet.id,
      message: 'Flashcard set saved successfully'
    })

  } catch (error: any) {
    console.error('Error in save-flashcards API:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
} 