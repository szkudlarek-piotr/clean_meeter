import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getHumanFromSubstringSorted(deliveredSubstring, mode){
    let returnedArr = []
    let queryString
    switch (mode) {
        case "visits":
            queryString = `
                WITH human_visits_count AS (
                    SELECT party_people.ID AS humanId, COALESCE(COUNT(visit_guest.guest_id), 0) as interaction_count
                    FROM party_people
                    LEFT JOIN visit_guest ON party_people.ID = visit_guest.guest_id
                    GROUP BY party_people.ID
                )
                SELECT id, CONCAT(name, ' ', surname) as full_name 
                FROM party_people
                JOIN human_visits_count ON party_people.ID = human_visits_count.humanId
                WHERE CONCAT(name, ' ', surname) LIKE ?
                ORDER BY human_visits_count.interaction_count DESC, party_people.surname, party_people.name;
            `

            break
        case "meetings":
            queryString = `
            WITH human_meetings_count AS (
                SELECT party_people.ID AS humanId, COALESCE(COUNT(meeting_human.human_id), 0) as interaction_count
                FROM party_people
                LEFT JOIN meeting_human ON party_people.ID = meeting_human.human_id
                GROUP BY party_people.ID
            )
            SELECT id, CONCAT(name, ' ', surname) as full_name 
            FROM party_people
            JOIN human_meetings_count ON party_people.ID = human_meetings_count.humanId
            WHERE CONCAT(name, ' ', surname) LIKE ?
            ORDER BY human_meetings_count.interaction_count DESC, party_people.surname, party_people.name;
            `
            break
        case "events":
            queryString = `
            WITH human_events_count AS (
                SELECT party_people.ID AS humanId, COALESCE(COUNT(event_companion.human_id), 0) as interaction_count
                FROM party_people
                LEFT JOIN event_companion ON party_people.ID = event_companion.human_id
                GROUP BY party_people.ID
            )
            SELECT id, CONCAT(name, ' ', surname) as full_name 
            FROM party_people
            JOIN human_events_count ON party_people.ID = human_events_count.humanId
            WHERE CONCAT(name, ' ', surname) LIKE ?
            ORDER BY human_events_count.interaction_count DESC, party_people.surname, party_people.name;
            `
            break
        case "quotes": 
            queryString = `WITH human_quotes_count AS (
                SELECT party_people.ID AS humanId, COALESCE(COUNT(golden_quotes.human_id), 0) as interaction_count
                FROM party_people
                LEFT JOIN golden_quotes ON party_people.ID = golden_quotes.human_id
                GROUP BY party_people.ID
            )
            SELECT id, CONCAT(name, ' ', surname) as full_name 
            FROM party_people
            JOIN human_quotes_count ON party_people.ID = human_quotes_count.humanId
            WHERE CONCAT(name, ' ', surname) LIKE ?
            ORDER BY human_quotes_count.interaction_count DESC, party_people.surname, party_people.name;
            `
            break

    }
        const [possiblePeopleArr] = await pool.query(queryString, [`%${deliveredSubstring}%`])
        for (let human of possiblePeopleArr) {
            let newHumanToAdd = {"id": human.id, "name": human.full_name, "photoDir": getHumanPhotoDir(human.id)}
            returnedArr.push(newHumanToAdd)
        }
    return returnedArr
}