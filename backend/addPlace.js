import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addPlace(placeName, placeCategory, lat, lon, wasVisited) {
    const visitsReqText = "INSERT INTO `places` (`id`, `place_name`, `category`, `latitude`, `longitude`, `was_visited`) VALUES (NULL, ?, ?, ?, ?, ?)"
    try {
        const [addPlaceReq] = await pool.query(visitsReqText, [placeName, placeCategory, lat, lon, wasVisited])
        return addPlaceReq
    }
    catch (error) {
        return error
    }

}
