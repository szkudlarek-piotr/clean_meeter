import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getOftenSeenWith(humanId) {
    const longQueryText = `
    SELECT id, CONCAT(name, ' ', surname) AS full_name, COALESCE(covisits_count.covisits_c, 0) AS covisits_counted, COALESCE(comeetings_count.comeetings_c, 0) AS comeetings_counted, COALESCE(coevents_count.coevents_c, 0) AS coevents_counted, COALESCE(wed_invitations.inv_c, 0) AS wed_inv_active, 
    CASE
        WHEN id = spouse_table.spouse_id THEN 10
        ELSE 0 
    END AS marriage_points,
    3 * COALESCE(wed_invitations.inv_c, 0) + COALESCE(covisits_count.covisits_c, 0) + COALESCE(comeetings_count.comeetings_c, 0) + COALESCE(coevents_count.coevents_c, 0) * 0.5 + CASE
        WHEN id = spouse_table.spouse_id THEN 10
        ELSE 0 END AS relation_points 
    FROM party_people
    LEFT JOIN (SELECT guest_id, COUNT(guest_id) AS covisits_c
    FROM visit_guest
    WHERE visit_id IN (
        SELECT visit_id 
        FROM visit_guest
        WHERE guest_id  = ?
    ) 
    AND guest_id != ?
    GROUP BY guest_id) covisits_count on covisits_count.guest_id = party_people.ID
    LEFT JOIN (
        SELECT human_id, COUNT(human_id) AS comeetings_c
        FROM meeting_human
        WHERE meeting_id IN (
            SELECT meeting_id 
            FROM meeting_human 
            WHERE human_id = ?) 
        AND human_id != ?
        GROUP BY human_id) comeetings_count ON party_people.id = comeetings_count.human_id
    LEFT JOIN (
        SELECT human_id, COUNT(human_id) AS coevents_c
        FROM event_companion
        WHERE event_id IN (
            SELECT event_id 
            FROM event_companion
            WHERE human_id = ?)
        AND human_id != ?
        GROUP BY human_id) coevents_count ON party_people.id = coevents_count.human_id
    LEFT JOIN (
        SELECT wedding_guest.guest_id AS guest_id, COUNT(guest_id) AS inv_c
        FROM wedding_guest 
        WHERE wedding_guest.wedding_id IN (
            SELECT weddings.id 
            FROM weddings
            WHERE weddings.man_id = ? 
            OR weddings.woman_id = ?
        )
        GROUP BY guest_id
    ) AS wed_invitations ON wed_invitations.guest_id = party_people.id
    LEFT JOIN (
        SELECT
            CASE
            WHEN man_id = ? THEN woman_id
            WHEN woman_id = ? then man_id
        END AS spouse_id
        FROM weddings
        WHERE man_id = ? OR woman_id = ?) AS spouse_table
        ON party_people.ID = spouse_table.spouse_id
    WHERE (covisits_c IS NOT NULL OR comeetings_c IS NOT NULL OR coevents_c IS NOT NULL) AND
    3 * COALESCE(wed_invitations.inv_c, 0) + COALESCE(covisits_count.covisits_c, 0) + COALESCE(comeetings_count.comeetings_c, 0) + COALESCE(coevents_count.coevents_c, 0) + CASE
        WHEN id = spouse_table.spouse_id THEN 10
        ELSE 0 END > 1
    ORDER BY relation_points DESC, party_people.surname ASC, party_people.name ASC
    LIMIT 12
    -- I need to add wed_inv_passive and coweddings here;
    `
    const [longQueryResult] = await pool.query(longQueryText, [humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId, humanId])
    
    let returnedList = []
    for (let person of longQueryResult) {
        const addedDict = {"fullName": person.full_name, "photoDir": getHumanPhotoDir(person.id)}
        returnedList.push(addedDict)
    }
    return returnedList
}