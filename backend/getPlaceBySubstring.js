import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getPlaceBySubstring(inputString) {
    const placesReqText = `SELECT places.id AS id, places.place_name AS name, places.category as category FROM places WHERE places.place_name LIKE ?;`
    const [placesReq] = await pool.query(placesReqText, `%${inputString}%`)
    return placesReq
}
