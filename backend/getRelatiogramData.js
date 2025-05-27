import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

async function getRelatiogramData() {
    const queryText = `
    WITH RECURSIVE all_months AS (
        SELECT DATE('2023-12-01') AS month_date
        UNION ALL
        SELECT DATE_ADD(month_date, INTERVAL 1 MONTH)
        FROM all_months
        WHERE month_date < CURRENT_DATE()
    ), 
    visit_human_count AS (
        SELECT DATE_FORMAT(visits.visit_date, '%Y-%m') AS formated_date, visit_guest.guest_id AS human_id, COUNT(guest_id) AS visits_in_month
        FROM visit_guest
        JOIN visits ON visits.visit_id = visit_guest.visit_id
        GROUP BY guest_id, DATE_FORMAT(visits.visit_date, '%Y-%m')
    ),
    meeting_human_count AS (
        SELECT DATE_FORMAT(meetings.meeting_date, '%Y-%m') AS formated_date, meeting_human.human_id AS human_id, COUNT(human_id) AS meetings_in_month
        FROM meeting_human
        JOIN meetings ON meeting_human.meeting_id = meetings.ID
        GROUP BY meeting_human.human_id, DATE_FORMAT(meetings.meeting_date, '%Y-%m')
    )
    SELECT 
        party_people.id, 
        CONCAT(party_people.name, ' ', party_people.surname) AS full_name,
        DATE_FORMAT(all_months.month_date, '%Y-%m') AS formated_date, 
        COALESCE(visit_human_count.visits_in_month, 0) AS visits_in_month,
        COALESCE(meeting_human_count.meetings_in_month, 0) AS meetings_in_month
    FROM party_people
    CROSS JOIN all_months
    LEFT JOIN visit_human_count 
        ON visit_human_count.human_id = party_people.ID 
        AND visit_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN meeting_human_count ON
        meeting_human_count.human_id = party_people.ID
        AND meeting_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    WHERE party_people.ID IN (7, 41, 13, 2137);
    `
}
