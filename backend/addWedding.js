import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addWedding(date, groomId, brideId, infoAfterHover, partnerId, weddingPlace, partyPlace, hotelName, description, was_i_invited) {
    if (partnerId != "null") {
        const addWeddingText = "INSERT INTO `weddings` (`id`, `date`, `man_id`, `woman_id`, `info_after_hover`, `partner_id`, `wedding_place_name`, `party_place_text`, `hotel_name`, `description`, `was_i_invited`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
        const [addWeddingReq] = await pool.query(addWeddingText, [date, groomId, brideId, infoAfterHover, partnerId, weddingPlace, partyPlace, hotelName, description, was_i_invited])
    }
    else {
        const addWeddingText = "INSERT INTO `weddings` (`id`, `date`, `man_id`, `woman_id`, `info_after_hover`, `wedding_place_name`, `party_place_text`, `hotel_name`, `description`, `was_i_invited`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
        const [addWeddingReq] = await pool.query(addWeddingText, [date, groomId, brideId, infoAfterHover,  weddingPlace, partyPlace, hotelName, description, was_i_invited])
    }

    return addWeddingReq
}
