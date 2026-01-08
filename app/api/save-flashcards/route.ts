import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Log presence for debugging
    console.log('API Save Call - Env Check:', { hasUrl: !!supabaseUrl, hasAnonKey: !!supabaseAnonKey })

    if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('your_')) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing or using placeholder keys in .env.local.' },
        { status: 500 }
      )
    }

    // Create Supabase client with user's specific session
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: 'Auth session error: ' + sessionError.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No active session found.' }, { status: 401 })
    }

    console.log('Saving for user:', session.user.id)

    // Insert flashcard set
    const { data: flashcardSet, error: setError } = await supabase
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

    const { error: cardsError } = await supabase
      .from('flashcards')
      .insert(flashcardData)

    if (cardsError) {
      console.error('Error creating flashcards:', cardsError)
      console.error('Cards error details:', JSON.stringify(cardsError, null, 2))
      // If flashcards fail to insert, clean up the set
      await supabase.from('flashcard_sets').delete().eq('id', flashcardSet.id)

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