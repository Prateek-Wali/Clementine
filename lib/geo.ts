/* Pulling geographical data from google places API to check if user is near alchoholic beverages*/
import {TriggerLocation} from '../types/triggerLocation'

export async function getNearbyTriggerLocations(
    lat: number,
    lng: number,
    radiusMeters: number=200
):Promise<TriggerLocation[]>{
    const results: TriggerLocation[] = [];
    const types = ["bar", "liquor_store", "night_clubs", "pub"]
    //loop through each type of place that sells alchohol
    function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371e3; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // returns meters
    }
    for (const type of types){
        //gogole places api request url with coords, radius, category
        const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
        url.searchParams.set("location", `${lat},${lng}`);
        url.searchParams.set("radius", String(radiusMeters));
        url.searchParams.set("type", type);
        url.searchParams.set("key", process.env.GP_API!)
        
        //calling google API
        const res = await fetch(url.toString());
        const data = await res.json();
        // chaecking if api respose was successful
        console.log("Google response:", JSON.stringify(data, null, 2));
        
        for (const place of data.results) {
            const distance = haversineDistance(
                lat, lng,
                place.geometry.location.lat,
                place.geometry.location.lng
            );

            results.push({
                id: place.place_id,
                name: place.name,
                coords: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                },
                distanceMeters: Math.round(distance), // e.g. 143
            });
            }

    }
    return results;
}