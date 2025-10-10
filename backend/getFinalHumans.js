import mysql from 'mysql2'
import dotenv from 'dotenv'
import path from 'path'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
import getCliquePhoto from './getPhotoFromCliqueId.js';
import fs from "fs"
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getFinalHumans(){ 
    let returnedArr = []
    const queryText =  `
WITH visits_count AS ( 
        SELECT guest_id AS human_id, COUNT(guest_id) AS visit_c
        FROM visit_guest
        GROUP BY guest_id
    ),
    recent_visits_count AS ( 
        SELECT guest_id AS human_id, COUNT(guest_id) AS visit_c
        FROM visit_guest
        JOIN visits ON visits.visit_id = visit_guest.visit_id
        WHERE visits.visit_date >= CURDATE() - INTERVAL 2 YEAR
        GROUP BY guest_id
    ),
    meetings_count AS (
        SELECT human_id, COUNT(human_id) AS meeting_c
        FROM meeting_human
        GROUP BY human_id
    ),
    recent_meetings_count AS (
        SELECT human_id, COUNT(human_id) AS meeting_c
        FROM meeting_human
        JOIN meetings ON meetings.ID = meeting_human.meeting_id
        WHERE meetings.meeting_date >= CURDATE() - INTERVAL 1 YEAR
        GROUP BY human_id
    ),
    events_count AS (
        SELECT human_id, COUNT(human_id) AS event_c
        FROM event_companion
        GROUP BY human_id
    ),
    recent_events_count AS (
        SELECT human_id, COUNT(human_id) AS event_c
        FROM event_companion
        JOIN events ON event_companion.event_id = events.id
        WHERE events.meLeavingDate >= CURDATE() - INTERVAL 6 MONTH
        GROUP BY human_id
    ),
    wed_inv_count AS (
        SELECT person_id, COUNT(person_id) AS wed_inv_c
        FROM (
            SELECT man_id AS person_id
            FROM weddings
            JOIN party_people ON party_people.ID = weddings.man_id
            JOIN cliques_names ON party_people.klika_id = cliques_names.id
            WHERE cliques_names.id != 5 AND weddings.was_i_invited = 1
            
            UNION ALL
            
            SELECT woman_id AS person_id
            FROM weddings
            JOIN party_people ON party_people.ID = weddings.woman_id
            JOIN cliques_names ON party_people.klika_id = cliques_names.id
            WHERE cliques_names.id != 5 AND weddings.was_i_invited = 1
        ) AS all_invites
        GROUP BY person_id
    ),

    wed_acc_count AS (
        SELECT person_id, COUNT(person_id) AS wed_acc_c
        FROM (
            SELECT man_id AS person_id
            FROM weddings
            JOIN party_people ON party_people.ID = weddings.man_id
            JOIN cliques_names ON party_people.klika_id = cliques_names.id
            WHERE cliques_names.id = 5 AND weddings.was_i_invited = 1
            
            UNION ALL
            
            SELECT woman_id AS person_id
            FROM weddings
            JOIN party_people ON party_people.ID = weddings.woman_id
            JOIN cliques_names ON party_people.klika_id = cliques_names.id
            WHERE cliques_names.id = 5 AND weddings.was_i_invited = 1
        ) AS all_wed_acc
        GROUP BY person_id
    ), 
    wed_partner_count AS (
        SELECT partner_id, COUNT(partner_id) AS wed_partner_c
        FROM weddings
        GROUP BY partner_id
    ),
    recent_wed_partner_count AS (
        SELECT partner_id, COUNT(partner_id) AS wed_partner_c
        FROM weddings
        WHERE weddings.date >= CURDATE() - INTERVAL 2 YEAR
        GROUP BY partner_id
    ),
    wed_guest_count AS (
        SELECT guest_id, COUNT(guest_id) AS wed_guest_c
        FROM wedding_guest
        GROUP BY guest_id
    ),
    recent_wed_guest_count AS (
        SELECT guest_id, COUNT(guest_id) AS wed_guest_c
        FROM wedding_guest
        JOIN weddings ON weddings.id = wedding_guest.wedding_id
        WHERE weddings.date >= CURDATE() - INTERVAL 1 YEAR
        GROUP BY guest_id
    ),
    trips_count AS (
        SELECT human_id, COUNT(human_id) AS trips_c
        FROM citybreak_companion
        GROUP BY human_id
    ),
    quotes_count AS (
    	SELECT human_id, COUNT(human_id) AS quotes_c
        FROM golden_quotes
        GROUP BY human_id
    )
    SELECT 
        party_people.id, 
        CONCAT(party_people.name, ' ', party_people.surname) AS full_name,
        party_people.klika_id AS clique_id,
        cliques_names.clique_name AS clique_name,
        COALESCE(visits_count.visit_c, 0) AS visits_c, 
        COALESCE(meetings_count.meeting_c, 0) AS meetings_c,
        COALESCE(events_count.event_c, 0) AS events_c,
        COALESCE(wed_inv_count.wed_inv_c, 0) AS wed_inv_c,
        COALESCE(wed_acc_count.wed_acc_c, 0) AS wed_acc_c,
        COALESCE(wed_partner_count.wed_partner_c, 0) AS wed_partner_c,
        COALESCE(wed_guest_count.wed_guest_c, 0) AS wed_guest_c,
        COALESCE(trips_count.trips_c, 0) AS trips_c,
        (SELECT quote FROM golden_quotes WHERE golden_quotes.is_public=1 AND golden_quotes.human_id = party_people.ID ORDER BY RAND() LIMIT 1) AS quote,
        COALESCE(meetings_count.meeting_c, 0) + COALESCE(events_count.event_c, 0) + COALESCE(wed_inv_count.wed_inv_c, 0) + COALESCE(wed_acc_count.wed_acc_c, 0) + COALESCE(wed_guest_count.wed_guest_c, 0) +  COALESCE(wed_partner_count.wed_partner_c, 0) + COALESCE(trips_count.trips_c, 0) AS other_interactions_c,
        6 * COALESCE(recent_visits_count.visit_c, 0) + 3 * COALESCE(recent_meetings_count.meeting_c, 0) + COALESCE(recent_events_count.event_c, 0) + COALESCE(wed_inv_count.wed_inv_c, 0) * 15 + 3 * COALESCE(wed_acc_count.wed_acc_c, 0) + COALESCE(recent_wed_guest_count.wed_guest_c, 0) + 6 * COALESCE(wed_partner_count.wed_partner_c, 0) + COALESCE(trips_count.trips_c, 0) * 3 AS rank_points

    FROM party_people 
    LEFT JOIN cliques_names ON cliques_names.id = party_people.klika_id
    LEFT JOIN visits_count ON visits_count.human_id = party_people.id
    LEFT JOIN recent_visits_count ON recent_visits_count.human_id = party_people.id
    LEFT JOIN meetings_count ON meetings_count.human_id = party_people.id
    LEFT JOIN recent_meetings_count ON recent_meetings_count.human_id = party_people.id
    LEFT JOIN events_count ON events_count.human_id = party_people.id
    LEFT JOIN recent_events_count ON recent_events_count.human_id = party_people.id
    LEFT JOIN wed_inv_count ON wed_inv_count.person_id = party_people.id
    LEFT JOIN wed_acc_count ON wed_acc_count.person_id = party_people.id
    LEFT JOIN wed_partner_count ON wed_partner_count.partner_id = party_people.id
    LEFT JOIN recent_wed_partner_count ON recent_wed_partner_count.partner_id = party_people.id
    LEFT JOIN wed_guest_count ON wed_guest_count.guest_id = party_people.id
    LEFT JOIN recent_wed_guest_count ON recent_wed_guest_count.guest_id = party_people.id
    LEFT JOIN trips_count ON trips_count.human_id = party_people.id
    LEFT JOIN quotes_count ON quotes_count.human_id = party_people.ID
    WHERE party_people.klika_id != 15 AND 6 * COALESCE(recent_visits_count.visit_c, 0) + 3 * COALESCE(recent_meetings_count.meeting_c, 0) + COALESCE(recent_events_count.event_c, 0) + COALESCE(wed_inv_count.wed_inv_c, 0) * 15 + 3 * COALESCE(wed_acc_count.wed_acc_c, 0) + COALESCE(wed_guest_count.wed_guest_c, 0) + 6 * COALESCE(recent_wed_partner_count.wed_partner_c, 0) + COALESCE(trips_count.trips_c, 0) * 3 > 1 OR quotes_count.quotes_c > 100
    ORDER BY rank_points DESC;
    `
    //I created a view in my database that has almost all info I need to create human tiles
    const [humansArr] = await pool.query(queryText)
    for (let human of humansArr) {
        const idAsString = human.id.toString()
        const humanName = human.full_name
        const humanPhotoDir = getHumanPhotoDir(idAsString)
        const cliquePhotoDir = getCliquePhoto(human.clique_id)
        const newDict = {"name": humanName, "photoDir": humanPhotoDir, "cliqueName": human.clique_name, "cliquePhoto": cliquePhotoDir, "visits": human.visits_c, "meetings": human.other_interactions_c, "quote": human.quote, "id": human.id.toString()}
        returnedArr.push(newDict)
    }
    return returnedArr
}