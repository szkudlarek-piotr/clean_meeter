import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getPlacesData(humanId) {
    const queryText = `SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, COUNT(places.id) as place_count
    FROM visits
    JOIN places ON visits.place_id = places.id
    WHERE visits.visit_id IN (SELECT visit_guest.visit_id FROM visit_guest WHERE visit_guest.guest_id = ?)
    group by places.id
    UNION
    SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, COUNT(places.id) as place_count
    FROM meetings
    JOIN places ON meetings.place_id = places.id
    WHERE meetings.ID IN (SELECT meeting_human.meeting_id FROM meeting_human WHERE meeting_human.human_id = ?)
    group by places.id
    UNION
    SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, COUNT(places.id) as place_count
    FROM events
    JOIN places ON events.place_id = places.id
    WHERE events.id IN (SELECT event_companion.event_id FROM event_companion WHERE event_companion.human_id = ?)
    group by places.id
    UNION
    SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, COUNT(places.id) as place_count
    FROM weddings
    JOIN places ON places.id = weddings.wedding_place_id
    WHERE weddings.man_id = ? OR weddings.woman_id = ? OR weddings.partner_id = ?
    group by places.id
    UNION
    SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, COUNT(places.id) as place_count
    FROM weddings
    JOIN places ON places.id = weddings.party_place_id
    WHERE weddings.man_id = ? OR weddings.woman_id = ? OR weddings.partner_id = ?
    group by places.id
    UNION
    SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, COUNT(places.id) as place_count
    FROM weddings
    JOIN places ON places.id = weddings.wedding_place_id
    WHERE weddings.id IN (SELECT wedding_guest.wedding_id FROM wedding_guest WHERE wedding_guest.guest_id = ?)
    group by places.id
    UNION
    SELECT places.place_name, places.category, places.latitude AS lat, places.longitude AS lng, COUNT(places.id) as place_count
    FROM weddings
    JOIN places ON places.id = weddings.party_place_id
    WHERE weddings.id IN (SELECT wedding_guest.wedding_id FROM wedding_guest WHERE wedding_guest.guest_id = ?)
    group by places.id`
    const [placesData] = await pool.query(queryText, [humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId])
    return placesData
}