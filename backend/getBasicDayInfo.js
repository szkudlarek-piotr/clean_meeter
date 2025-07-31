import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getBasicDayInfo(dateString) {
    const startDate = `${dateString} 00:00:00`
    const stopDate = `${dateString} 23:59:59`
    const queryText = `
    SELECT CONCAT(events.nameOfEvent, ' w miejscu ', events.place) AS title, event_companion.human_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "event" AS interaction_class
    FROM event_companion
    JOIN events ON events.id = event_companion.event_id
    JOIN party_people ON party_people.ID = event_companion.human_id
    WHERE events.meComingDate <= ?
    AND events.meLeavingDate >= ?
    UNION ALL
    SELECT visits.short_description AS title, visit_guest.guest_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, 'visit' AS interaction_class
    FROM visit_guest
    JOIN visits ON visits.visit_id = visit_guest.visit_id
    JOIN party_people ON party_people.ID = visit_guest.guest_id
    WHERE visits.visit_date <= ?
    AND ADDDATE(visits.visit_date, visits.visit_duration - 1) >= ?
    UNION ALL
    SELECT CONCAT(meetings.short_description, ' w miejscu ', meetings.Place) AS title, meeting_human.human_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, 'meeting' AS interaction_class
    FROM meeting_human
    JOIN meetings ON meeting_human.meeting_id = meetings.ID
    JOIN party_people ON party_people.ID = meeting_human.human_id
    WHERE meetings.meeting_date <= ?
    AND meetings.meeting_date >= ?
    UNION ALL
    SELECT citybreaks.Place AS title, citybreak_companion.human_id, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "trip" AS interaction_class
    FROM citybreak_companion
    JOIN citybreaks ON citybreaks.ID = citybreak_companion.citybreak_id
    JOIN party_people ON party_people.ID = citybreak_companion.human_id
    WHERE citybreaks.Date_start <= ?
    AND citybreaks.Date_stop >= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, wedding_guest.guest_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, 'wedding' AS interaction_class
    FROM wedding_guest
    JOIN weddings ON weddings.id = wedding_guest.wedding_id
    JOIN party_people ON party_people.ID = wedding_guest.guest_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, weddings.man_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "wedding" AS interaction_class
    FROM weddings
    JOIN party_people ON party_people.ID =  weddings.man_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, weddings.woman_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "wedding" AS interaction_class
    FROM weddings
    JOIN party_people ON party_people.ID =  weddings.woman_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, weddings.partner_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "wedding" AS interaction_class
    FROM weddings
    JOIN party_people ON party_people.ID =  weddings.partner_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?
    ;
    `
    const [dayQuery] = await pool.query(queryText, [
        stopDate, startDate, 
        stopDate, startDate, 
        stopDate, startDate, 
        stopDate, startDate, 
        startDate, stopDate, 
        startDate, stopDate, 
        startDate, stopDate,  
        startDate, stopDate])
    return dayQuery
}