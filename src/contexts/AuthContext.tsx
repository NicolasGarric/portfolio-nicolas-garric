import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Les données disponibles dans le contexte
interface AuthContextType {
    user: User | null           // L'utilisateur connecté (null si déconnecté)
    profile: Profile | null     // Son profil (username, share_scores)
    loading: boolean            // En cours de chargement ?
    signOut: () => Promise<void>
}

interface Profile {
    id: string
    username: string
    share_scores: boolean
}

// Crée le contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => {},
})

// Le Provider englobe toute l'app et fournit les données d'auth
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    // Charge le profil depuis Supabase
    const loadProfile = async (userId: string) => {
        const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

        if (data) setProfile(data)
    }

    useEffect(() => {
        // Vérifie si une session existe déjà (page rechargée)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) loadProfile(session.user.id)
            setLoading(false)
        })

        // Écoute les changements d'état d'auth (connexion/déconnexion)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    loadProfile(session.user.id)
                } else {
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        // Nettoyage — arrête d'écouter quand le composant se démonte
        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
        {children}
        </AuthContext.Provider>
    )
}

// Hook custom — permet d'utiliser le contexte en une ligne
// Au lieu de useContext(AuthContext) partout, on écrit useAuth()
export const useAuth = () => useContext(AuthContext)
