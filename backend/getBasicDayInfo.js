import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getBasicDayInfo(dateString) {
    const startDate = `${dateString} 00:00:00`
    const stopDate = `${dateString} 23:59:59`
    const queryText = `WITH dayInteractions AS 
    (SELECT CONCAT(events.nameOfEvent, ' w miejscu ', events.place) AS title, event_companion.human_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "event" AS interaction_class, events.description as longDesc, events.dateStart AS interactionTime
    FROM event_companion
    JOIN events ON events.id = event_companion.event_id
    JOIN party_people ON party_people.ID = event_companion.human_id
    WHERE events.meComingDate <= ?
    AND events.meLeavingDate >= ?
    UNION ALL
    SELECT visits.short_description AS title, visit_guest.guest_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, 'visit' AS interaction_class, visits.description as longDesc, visits.visit_date AS interactionTime
    FROM visit_guest
    JOIN visits ON visits.visit_id = visit_guest.visit_id
    JOIN party_people ON party_people.ID = visit_guest.guest_id
    WHERE visits.visit_date <= ?
    AND ADDDATE(visits.visit_date, visits.visit_duration - 1) >= ?
    UNION ALL
    SELECT CONCAT(meetings.short_description, ' w miejscu ', meetings.Place) AS title, meeting_human.human_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, 'meeting' AS interaction_class, meetings.long_desc AS longDesc, meetings.meeting_date AS interactionTime
    FROM meeting_human
    JOIN meetings ON meeting_human.meeting_id = meetings.ID
    JOIN party_people ON party_people.ID = meeting_human.human_id
    WHERE meetings.meeting_date <= ?
    AND meetings.meeting_date >= ?
    UNION ALL
    SELECT citybreaks.Place AS title, citybreak_companion.human_id, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "trip" AS interaction_class, citybreaks.long_description AS longDesc, citybreaks.Date_Start AS interactionTime
    FROM citybreak_companion
    JOIN citybreaks ON citybreaks.ID = citybreak_companion.citybreak_id
    JOIN party_people ON party_people.ID = citybreak_companion.human_id
    WHERE citybreaks.Date_start <= ?
    AND citybreaks.Date_stop >= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, wedding_guest.guest_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, 'wedding' AS interaction_class, weddings.description AS longDesc, weddings.date AS interactionTime
    FROM wedding_guest
    JOIN weddings ON weddings.id = wedding_guest.wedding_id
    JOIN party_people ON party_people.ID = wedding_guest.guest_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, weddings.man_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "wedding" AS interaction_class, weddings.description AS longDesc, weddings.date AS interactionTime
    FROM weddings
    JOIN party_people ON party_people.ID =  weddings.man_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, weddings.woman_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "wedding" AS interaction_class, weddings.description AS longDesc, weddings.date AS interactionTime
    FROM weddings
    JOIN party_people ON party_people.ID =  weddings.woman_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?
    UNION ALL
    SELECT weddings.info_after_hover AS title, weddings.partner_id AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS full_name, "wedding" AS interaction_class, weddings.description AS longDesc, weddings.date AS interactionTime
    FROM weddings
    JOIN party_people ON party_people.ID =  weddings.partner_id
    WHERE weddings.date >= ?
    AND weddings.date <= ?)
    SELECT title, humanId, full_name, longDesc
    FROM dayInteractions
    ORDER BY interactionTime, title
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
    let humansArr = []
    for (let record of dayQuery) {
        let humanToAdd = {"humanId": record.humanId, "humanName": record.full_name, "photoDir": getHumanPhotoDir(record.humanId)}
        if (!humansArr.some(h => h.humanId === humanToAdd.humanId)) {
            humansArr.push(humanToAdd)
        }
    }
    console.log(humansArr)
    //console.log(dayQuery)
    return humansArr
}
//getBasicDayInfo('2024-11-11')