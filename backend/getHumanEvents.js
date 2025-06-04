import dotenv from 'dotenv'
import mysql from 'mysql2'
import createDateString from './multiuseFunctions/dateToString.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getHumanEvents(humanId) {
    const requestText = `
    SELECT nameOfEvent, meComingDate, meLeavingDate, place, description
    FROM events
    WHERE events.id IN (
        SELECT event_companion.event_id
        FROM event_companion
        WHERE event_companion.human_id = ?
    )
    ORDER BY meComingDate;
    `
    const [eventsQuery] = await pool.query(requestText, [humanId])
    const eventsList = []
    for (const databaseEvent of eventsQuery) {
        const eventName = databaseEvent.nameOfEvent;
        const comingDateString = createDateString(databaseEvent.meComingDate);
        const leavingDateString = createDateString(databaseEvent.meLeavingDate);

        const dateString = comingDateString === leavingDateString ? comingDateString : `${comingDateString} - ${leavingDateString}`
        const eventPlace = databaseEvent.place
        let eventDict = {"name": eventName, "date": dateString, "place": eventPlace}
        if (databaseEvent["description"]) {
            eventDict["longDesc"] = databaseEvent["description"]
        }
        eventsList.push(eventDict)

    }
    return eventsList
}