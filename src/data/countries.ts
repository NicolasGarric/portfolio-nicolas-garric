export interface Country {
    name: string
    mealdbArea: string  // Vide si pas dans TheMealDB
    lat: number
    lng: number
    playable: boolean   // true = peut être une bonne réponse
}

// ===== PAYS JOUABLES (disponibles dans TheMealDB) =====
export const PLAYABLE_COUNTRIES: Country[] = [
    { name: 'American', mealdbArea: 'American', lat: 37.09, lng: -95.71, playable: true },
    { name: 'British', mealdbArea: 'British', lat: 55.37, lng: -3.43, playable: true },
    { name: 'Canadian', mealdbArea: 'Canadian', lat: 56.13, lng: -106.34, playable: true },
    { name: 'Chinese', mealdbArea: 'Chinese', lat: 35.86, lng: 104.19, playable: true },
    { name: 'Croatian', mealdbArea: 'Croatian', lat: 45.10, lng: 15.20, playable: true },
    { name: 'Dutch', mealdbArea: 'Dutch', lat: 52.13, lng: 5.29, playable: true },
    { name: 'Egyptian', mealdbArea: 'Egyptian', lat: 26.82, lng: 30.80, playable: true },
    { name: 'Filipino', mealdbArea: 'Filipino', lat: 12.87, lng: 121.77, playable: true },
    { name: 'French', mealdbArea: 'French', lat: 46.22, lng: 2.21, playable: true },
    { name: 'Greek', mealdbArea: 'Greek', lat: 39.07, lng: 21.82, playable: true },
    { name: 'Indian', mealdbArea: 'Indian', lat: 20.59, lng: 78.96, playable: true },
    { name: 'Irish', mealdbArea: 'Irish', lat: 53.41, lng: -8.24, playable: true },
    { name: 'Italian', mealdbArea: 'Italian', lat: 41.87, lng: 12.56, playable: true },
    { name: 'Jamaican', mealdbArea: 'Jamaican', lat: 18.10, lng: -77.29, playable: true },
    { name: 'Japanese', mealdbArea: 'Japanese', lat: 36.20, lng: 138.25, playable: true },
    { name: 'Kenyan', mealdbArea: 'Kenyan', lat: -0.02, lng: 37.90, playable: true },
    { name: 'Malaysian', mealdbArea: 'Malaysian', lat: 4.21, lng: 101.97, playable: true },
    { name: 'Mexican', mealdbArea: 'Mexican', lat: 23.63, lng: -102.55, playable: true },
    { name: 'Moroccan', mealdbArea: 'Moroccan', lat: 31.79, lng: -7.09, playable: true },
    { name: 'Polish', mealdbArea: 'Polish', lat: 51.91, lng: 19.14, playable: true },
    { name: 'Portuguese', mealdbArea: 'Portuguese', lat: 39.39, lng: -8.22, playable: true },
    { name: 'Russian', mealdbArea: 'Russian', lat: 61.52, lng: 105.31, playable: true },
    { name: 'Spanish', mealdbArea: 'Spanish', lat: 40.46, lng: -3.74, playable: true },
    { name: 'Thai', mealdbArea: 'Thai', lat: 15.87, lng: 100.99, playable: true },
    { name: 'Tunisian', mealdbArea: 'Tunisian', lat: 33.88, lng: 9.53, playable: true },
    { name: 'Turkish', mealdbArea: 'Turkish', lat: 38.96, lng: 35.24, playable: true },
    { name: 'Ukrainian', mealdbArea: 'Ukrainian', lat: 48.37, lng: 31.16, playable: true },
    { name: 'Uruguayan', mealdbArea: 'Uruguayan', lat: -32.52, lng: -55.76, playable: true },
    { name: 'Vietnamese', mealdbArea: 'Vietnamese', lat: 14.05, lng: 108.27, playable: true },
]

// ===== TOUS LES PAYS DU MONDE (pour autocomplétion et chaud/froid) =====
export const ALL_COUNTRIES: Country[] = [
    ...PLAYABLE_COUNTRIES,
    { name: 'Afghanistan', mealdbArea: '', lat: 33.93, lng: 67.71, playable: false },
    { name: 'Albania', mealdbArea: '', lat: 41.15, lng: 20.17, playable: false },
    { name: 'Algeria', mealdbArea: '', lat: 28.03, lng: 1.66, playable: false },
    { name: 'Angola', mealdbArea: '', lat: -11.20, lng: 17.87, playable: false },
    { name: 'Argentina', mealdbArea: '', lat: -38.41, lng: -63.61, playable: false },
    { name: 'Armenia', mealdbArea: '', lat: 40.07, lng: 45.03, playable: false },
    { name: 'Australia', mealdbArea: '', lat: -25.27, lng: 133.77, playable: false },
    { name: 'Austria', mealdbArea: '', lat: 47.51, lng: 14.55, playable: false },
    { name: 'Azerbaijan', mealdbArea: '', lat: 40.14, lng: 47.57, playable: false },
    { name: 'Bahrain', mealdbArea: '', lat: 25.93, lng: 50.63, playable: false },
    { name: 'Bangladesh', mealdbArea: '', lat: 23.68, lng: 90.35, playable: false },
    { name: 'Belarus', mealdbArea: '', lat: 53.71, lng: 27.95, playable: false },
    { name: 'Belgium', mealdbArea: '', lat: 50.50, lng: 4.46, playable: false },
    { name: 'Bolivia', mealdbArea: '', lat: -16.29, lng: -63.58, playable: false },
    { name: 'Bosnia', mealdbArea: '', lat: 43.91, lng: 17.67, playable: false },
    { name: 'Brazil', mealdbArea: '', lat: -14.23, lng: -51.92, playable: false },
    { name: 'Bulgaria', mealdbArea: '', lat: 42.73, lng: 25.48, playable: false },
    { name: 'Cambodia', mealdbArea: '', lat: 12.56, lng: 104.99, playable: false },
    { name: 'Cameroon', mealdbArea: '', lat: 3.84, lng: 11.50, playable: false },
    { name: 'Chile', mealdbArea: '', lat: -35.67, lng: -71.54, playable: false },
    { name: 'Colombia', mealdbArea: '', lat: 4.57, lng: -74.29, playable: false },
    { name: 'Congo', mealdbArea: '', lat: -4.03, lng: 21.75, playable: false },
    { name: 'Costa Rica', mealdbArea: '', lat: 9.74, lng: -83.75, playable: false },
    { name: 'Cuba', mealdbArea: '', lat: 21.52, lng: -77.78, playable: false },
    { name: 'Czech Republic', mealdbArea: '', lat: 49.82, lng: 15.47, playable: false },
    { name: 'Denmark', mealdbArea: '', lat: 56.26, lng: 9.50, playable: false },
    { name: 'Ecuador', mealdbArea: '', lat: -1.83, lng: -78.18, playable: false },
    { name: 'El Salvador', mealdbArea: '', lat: 13.79, lng: -88.89, playable: false },
    { name: 'Ethiopia', mealdbArea: '', lat: 9.14, lng: 40.48, playable: false },
    { name: 'Finland', mealdbArea: '', lat: 61.92, lng: 25.74, playable: false },
    { name: 'Georgia', mealdbArea: '', lat: 42.31, lng: 43.35, playable: false },
    { name: 'Germany', mealdbArea: '', lat: 51.16, lng: 10.45, playable: false },
    { name: 'Ghana', mealdbArea: '', lat: 7.94, lng: -1.02, playable: false },
    { name: 'Guatemala', mealdbArea: '', lat: 15.78, lng: -90.23, playable: false },
    { name: 'Honduras', mealdbArea: '', lat: 15.19, lng: -86.24, playable: false },
    { name: 'Hungary', mealdbArea: '', lat: 47.16, lng: 19.50, playable: false },
    { name: 'Indonesia', mealdbArea: '', lat: -0.78, lng: 113.92, playable: false },
    { name: 'Iran', mealdbArea: '', lat: 32.42, lng: 53.68, playable: false },
    { name: 'Iraq', mealdbArea: '', lat: 33.22, lng: 43.67, playable: false },
    { name: 'Israel', mealdbArea: '', lat: 31.04, lng: 34.85, playable: false },
    { name: 'Jordan', mealdbArea: '', lat: 30.58, lng: 36.23, playable: false },
    { name: 'Kazakhstan', mealdbArea: '', lat: 48.01, lng: 66.92, playable: false },
    { name: 'Kuwait', mealdbArea: '', lat: 29.31, lng: 47.48, playable: false },
    { name: 'Laos', mealdbArea: '', lat: 19.85, lng: 102.49, playable: false },
    { name: 'Latvia', mealdbArea: '', lat: 56.87, lng: 24.60, playable: false },
    { name: 'Lebanon', mealdbArea: '', lat: 33.85, lng: 35.86, playable: false },
    { name: 'Libya', mealdbArea: '', lat: 26.33, lng: 17.22, playable: false },
    { name: 'Lithuania', mealdbArea: '', lat: 55.16, lng: 23.88, playable: false },
    { name: 'Luxembourg', mealdbArea: '', lat: 49.81, lng: 6.12, playable: false },
    { name: 'Madagascar', mealdbArea: '', lat: -18.76, lng: 46.86, playable: false },
    { name: 'Mali', mealdbArea: '', lat: 17.57, lng: -3.99, playable: false },
    { name: 'Malta', mealdbArea: '', lat: 35.93, lng: 14.37, playable: false },
    { name: 'Mauritania', mealdbArea: '', lat: 21.00, lng: -10.94, playable: false },
    { name: 'Moldova', mealdbArea: '', lat: 47.41, lng: 28.36, playable: false },
    { name: 'Mongolia', mealdbArea: '', lat: 46.86, lng: 103.84, playable: false },
    { name: 'Montenegro', mealdbArea: '', lat: 42.70, lng: 19.37, playable: false },
    { name: 'Myanmar', mealdbArea: '', lat: 21.91, lng: 95.95, playable: false },
    { name: 'Nepal', mealdbArea: '', lat: 28.39, lng: 84.12, playable: false },
    { name: 'New Zealand', mealdbArea: '', lat: -40.90, lng: 174.88, playable: false },
    { name: 'Nicaragua', mealdbArea: '', lat: 12.86, lng: -85.20, playable: false },
    { name: 'Niger', mealdbArea: '', lat: 17.60, lng: 8.08, playable: false },
    { name: 'Nigeria', mealdbArea: '', lat: 9.08, lng: 8.67, playable: false },
    { name: 'North Korea', mealdbArea: '', lat: 40.33, lng: 127.51, playable: false },
    { name: 'Norway', mealdbArea: '', lat: 60.47, lng: 8.46, playable: false },
    { name: 'Oman', mealdbArea: '', lat: 21.51, lng: 55.92, playable: false },
    { name: 'Pakistan', mealdbArea: '', lat: 30.37, lng: 69.34, playable: false },
    { name: 'Palestine', mealdbArea: '', lat: 31.95, lng: 35.23, playable: false },
    { name: 'Panama', mealdbArea: '', lat: 8.53, lng: -80.78, playable: false },
    { name: 'Paraguay', mealdbArea: '', lat: -23.44, lng: -58.44, playable: false },
    { name: 'Peru', mealdbArea: '', lat: -9.18, lng: -75.01, playable: false },
    { name: 'Philippines', mealdbArea: '', lat: 12.87, lng: 121.77, playable: false },
    { name: 'Qatar', mealdbArea: '', lat: 25.35, lng: 51.18, playable: false },
    { name: 'Romania', mealdbArea: '', lat: 45.94, lng: 24.96, playable: false },
    { name: 'Saudi Arabia', mealdbArea: '', lat: 23.88, lng: 45.07, playable: false },
    { name: 'Senegal', mealdbArea: '', lat: 14.49, lng: -14.45, playable: false },
    { name: 'Serbia', mealdbArea: '', lat: 44.01, lng: 21.00, playable: false },
    { name: 'Singapore', mealdbArea: '', lat: 1.35, lng: 103.81, playable: false },
    { name: 'Slovakia', mealdbArea: '', lat: 48.66, lng: 19.69, playable: false },
    { name: 'Slovenia', mealdbArea: '', lat: 46.15, lng: 14.99, playable: false },
    { name: 'Somalia', mealdbArea: '', lat: 5.15, lng: 46.19, playable: false },
    { name: 'South Africa', mealdbArea: '', lat: -30.55, lng: 22.93, playable: false },
    { name: 'South Korea', mealdbArea: '', lat: 35.90, lng: 127.76, playable: false },
    { name: 'Sudan', mealdbArea: '', lat: 12.86, lng: 30.21, playable: false },
    { name: 'Sweden', mealdbArea: '', lat: 60.12, lng: 18.64, playable: false },
    { name: 'Switzerland', mealdbArea: '', lat: 46.81, lng: 8.22, playable: false },
    { name: 'Syria', mealdbArea: '', lat: 34.80, lng: 38.99, playable: false },
    { name: 'Taiwan', mealdbArea: '', lat: 23.69, lng: 120.96, playable: false },
    { name: 'Tanzania', mealdbArea: '', lat: -6.36, lng: 34.88, playable: false },
    { name: 'Uganda', mealdbArea: '', lat: 1.37, lng: 32.29, playable: false },
    { name: 'United Arab Emirates', mealdbArea: '', lat: 23.42, lng: 53.84, playable: false },
    { name: 'United Kingdom', mealdbArea: '', lat: 55.37, lng: -3.43, playable: false },
    { name: 'United States', mealdbArea: '', lat: 37.09, lng: -95.71, playable: false },
    { name: 'Venezuela', mealdbArea: '', lat: 6.42, lng: -66.58, playable: false },
    { name: 'Yemen', mealdbArea: '', lat: 15.55, lng: 48.51, playable: false },
    { name: 'Zambia', mealdbArea: '', lat: -13.13, lng: 27.84, playable: false },
    { name: 'Zimbabwe', mealdbArea: '', lat: -19.01, lng: 29.15, playable: false },
]

// Garde COUNTRIES pour compatibilité avec le code existant
export const COUNTRIES = ALL_COUNTRIES

export function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export function getTemperature(distanceKm: number): {
    label: string
    emoji: string
    color: string
} {
    if (distanceKm < 500) return { label: 'Très chaud', emoji: '🔴', color: '#ff4444' }
    if (distanceKm < 1500) return { label: 'Chaud', emoji: '🟠', color: '#ff922b' }
    if (distanceKm < 3000) return { label: 'Tiède', emoji: '🟡', color: '#ffd43b' }
    if (distanceKm < 5000) return { label: 'Froid', emoji: '🔵', color: '#339af0' }
    return { label: 'Très froid', emoji: '❄️', color: '#74c0fc' }
}
