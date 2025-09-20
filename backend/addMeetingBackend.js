import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addMeeting(date, place, shortDesc, longDesc, meetingPlaceId) {
    if (meetingPlaceId.length > 0) {
        const queryText = "INSERT INTO `meetings` (`ID`, `meeting_date`, `Place`, `short_description`, `long_desc`, `place_id`) VALUES (NULL, ?, ?, ?, ?, ?);"
        const [addMeetingQuery] = await pool.query(queryText, [date, place, shortDesc, longDesc, meetingPlaceId])
        console.log(addMeetingQuery)
        return addMeetingQuery
    }
    else {
        const queryText = "INSERT INTO `meetings` (`ID`, `meeting_date`, `Place`, `short_description`, `long_desc`) VALUES (NULL, ?, ?, ?, ?);"
        const [addMeetingQuery] = await pool.query(queryText, [date, place, shortDesc, longDesc, meetingPlaceId])
        console.log(addMeetingQuery)
        return addMeetingQuery
    }


}