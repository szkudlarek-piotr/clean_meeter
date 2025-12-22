import dotenv from 'dotenv'
import mysql from 'mysql2'
import createDateString from './multiuseFunctions/dateToString.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getHumanMeetings(humanId, years) {
    const days = 365 * years
    const queryText = `
        SELECT short_description AS meetingTitle, meeting_date AS meetingDate, Place as meetingPlace, long_desc AS meetingDesc 
    FROM meetings 
    WHERE ID IN (
	    SELECT meeting_human.meeting_id
        FROM meeting_human
        WHERE meeting_human.human_id = ?
    )
        AND meetings.meeting_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    ORDER BY meetingDate DESC
    `
    const [meetingQuery] = await pool.query(queryText, [humanId, days])
    let meetingsList = []
    for ( const meeting of meetingQuery) {
        let meetingToAdd = {"title": meeting.meetingTitle, "date": createDateString(meeting.meetingDate), "place": meeting.meetingPlace}
        if (meeting["meetingDesc"] && meeting["meetingDesc"].length > 3) {
            meetingToAdd["longDesc"] = meeting.meetingDesc
        }
        meetingsList.push(meetingToAdd)
    }
    return meetingsList
}
