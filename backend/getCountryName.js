import pkg from 'country-reverse-geocoding';
const country_reverse_geocoding = pkg.country_reverse_geocoding
const crg = country_reverse_geocoding()
export default function getCountryName(lat, lng) {
    const countryName = crg.get_country(lat, lng)
    return countryName
}
