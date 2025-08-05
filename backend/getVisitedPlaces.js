import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getVisitedPlaces() {
    const queryText = `
    SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, places.was_visited
    FROM places
    WHERE places.category NOT IN ('Mieszkanie')
    `
    const [visitedPlacesData] = await pool.query(queryText)
    return visitedPlacesData
}
getVisitedPlaces()