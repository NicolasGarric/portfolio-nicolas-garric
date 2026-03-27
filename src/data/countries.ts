// Pays disponibles dans TheMealDB avec leurs coordonnées GPS
// et leur nom correspondant dans l'API
export interface Country {
    name: string        // Nom affiché
    mealdbArea: string  // Nom dans TheMealDB
    lat: number         // Latitude
    lng: number         // Longitude
}

export const COUNTRIES: Country[] = [
    { name: 'American', mealdbArea: 'American', lat: 37.09, lng: -95.71 },
    { name: 'British', mealdbArea: 'British', lat: 55.37, lng: -3.43 },
    { name: 'Canadian', mealdbArea: 'Canadian', lat: 56.13, lng: -106.34 },
    { name: 'Chinese', mealdbArea: 'Chinese', lat: 35.86, lng: 104.19 },
    { name: 'Croatian', mealdbArea: 'Croatian', lat: 45.10, lng: 15.20 },
    { name: 'Dutch', mealdbArea: 'Dutch', lat: 52.13, lng: 5.29 },
    { name: 'Egyptian', mealdbArea: 'Egyptian', lat: 26.82, lng: 30.80 },
    { name: 'Filipino', mealdbArea: 'Filipino', lat: 12.87, lng: 121.77 },
    { name: 'French', mealdbArea: 'French', lat: 46.22, lng: 2.21 },
    { name: 'Greek', mealdbArea: 'Greek', lat: 39.07, lng: 21.82 },
    { name: 'Indian', mealdbArea: 'Indian', lat: 20.59, lng: 78.96 },
    { name: 'Irish', mealdbArea: 'Irish', lat: 53.41, lng: -8.24 },
    { name: 'Italian', mealdbArea: 'Italian', lat: 41.87, lng: 12.56 },
    { name: 'Jamaican', mealdbArea: 'Jamaican', lat: 18.10, lng: -77.29 },
    { name: 'Japanese', mealdbArea: 'Japanese', lat: 36.20, lng: 138.25 },
    { name: 'Kenyan', mealdbArea: 'Kenyan', lat: -0.02, lng: 37.90 },
    { name: 'Malaysian', mealdbArea: 'Malaysian', lat: 4.21, lng: 101.97 },
    { name: 'Mexican', mealdbArea: 'Mexican', lat: 23.63, lng: -102.55 },
    { name: 'Moroccan', mealdbArea: 'Moroccan', lat: 31.79, lng: -7.09 },
    { name: 'Polish', mealdbArea: 'Polish', lat: 51.91, lng: 19.14 },
    { name: 'Portuguese', mealdbArea: 'Portuguese', lat: 39.39, lng: -8.22 },
    { name: 'Russian', mealdbArea: 'Russian', lat: 61.52, lng: 105.31 },
    { name: 'Spanish', mealdbArea: 'Spanish', lat: 40.46, lng: -3.74 },
    { name: 'Thai', mealdbArea: 'Thai', lat: 15.87, lng: 100.99 },
    { name: 'Tunisian', mealdbArea: 'Tunisian', lat: 33.88, lng: 9.53 },
    { name: 'Turkish', mealdbArea: 'Turkish', lat: 38.96, lng: 35.24 },
    { name: 'Ukrainian', mealdbArea: 'Ukrainian', lat: 48.37, lng: 31.16 },
    { name: 'Uruguayan', mealdbArea: 'Uruguayan', lat: -32.52, lng: -55.76 },
    { name: 'Vietnamese', mealdbArea: 'Vietnamese', lat: 14.05, lng: 108.27 },
]

// Calcule la distance en km entre deux points GPS (formule Haversine)
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

// Retourne le feedback chaud/froid selon la distance
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
