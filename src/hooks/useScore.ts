import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Ce hook retourne une fonction saveScore utilisable dans n'importe quel jeu
export function useScore() {
    const { user } = useAuth()

    const saveScore = useCallback(async (game: string, score: number) => {
        // Si l'utilisateur n'est pas connecté, on ne sauvegarde pas
        if (!user) return

        const { error } = await supabase
        .from('scores')
        .insert({
            user_id: user.id,
            game,
            score,
        })

        if (error) {
            console.error('Erreur sauvegarde score:', error)
        }
    }, [user])

    return { saveScore }
}
