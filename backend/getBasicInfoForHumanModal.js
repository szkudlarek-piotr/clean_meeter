import dotenv from 'dotenv'
import mysql from 'mysql2'
import getCliquePhoto from './getPhotoFromCliqueId.js'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getBasicInfoForModal(humanId) {
    const requestText = 
        `SELECT party_people.id as human_id, klika_id AS clique_id, cliques_names.clique_name AS clique_name, CONCAT(name, ' ', surname) AS full_name, party_people.gender AS gender, COALESCE(visit_c.visits_count, 0) AS visits_count, COALESCE(meeting_c.meeting_count,0) AS meetings_count, COALESCE(event_c.event_count, 0) AS event_count, COALESCE(quotes_c.quotes_count, 0) AS quotes_count,
            CASE
                WHEN party_people.gender = 'M' THEN id_wife.spouse_id
                WHEN party_people.gender = 'F' THEN id_husband.spouse_id
            END 
            AS spouse_id
        FROM party_people
        LEFT JOIN (
            SELECT guest_id, COUNT(guest_id) AS visits_count
            FROM visit_guest
            GROUP BY guest_id
        ) AS visit_c ON visit_c.guest_id = party_people.id
        LEFT JOIN (
            SELECT human_id, COUNT(human_id) AS meeting_count
            FROM meeting_human
            GROUP BY human_id
        ) AS meeting_c ON meeting_c.human_id = party_people.id
        LEFT JOIN (
            SELECT human_id, COUNT(human_id) AS event_count
            FROM event_companion
            GROUP BY human_id
        ) AS event_c ON event_c.human_id = party_people.id
        LEFT JOIN (
            SELECT human_id, COUNT(human_id) AS quotes_count
            FROM golden_quotes
            WHERE is_public = 1
            GROUP BY human_id
        ) AS quotes_c ON quotes_c.human_id = party_people.ID
        JOIN (
            SELECT party_people.ID AS left_id, weddings.woman_id AS spouse_id
            FROM party_people
            LEFT JOIN weddings ON party_people.id = weddings.man_id
        ) AS id_wife ON id_wife.left_id = party_people.ID
        JOIN (
            SELECT party_people.ID AS left_id, weddings.man_id AS spouse_id
            FROM party_people
            LEFT JOIN weddings ON party_people.id = weddings.woman_id
        ) AS id_husband ON id_husband.left_id = party_people.ID
        JOIN (
            SELECT id AS human_id, CONCAT(party_people.name, ' ', party_people.surname) AS full_name
            FROM party_people
        ) AS id_full_name ON id_full_name.human_id = party_people.id
        JOIN cliques_names ON party_people.klika_id = cliques_names.id
        WHERE party_people.id = ?;`
        const [getReq] = await pool.query(requestText, [humanId])
        console.log(getReq)
        let returnedDict = {
            "photoDir": getHumanPhotoDir(getReq[0]["human_id"]),
            "cliqueName": getReq[0]["clique_name"],
            "fullName": getReq[0]["full_name"],
            "gender": getReq[0]["gender"],
            "cliqueName": getReq[0]["clique_name"],
            "visitsCount": getReq[0]["visits_count"],
            "meetingsCount": getReq[0]["meetings_count"],
            "eventsCount": getReq[0]["event_count"],
            "quotesCount": getReq[0]["quotes_count"],
            "cliqueName": getReq[0]["clique_name"]
        }
        
        console.log(returnedDict)
        return returnedDict
}