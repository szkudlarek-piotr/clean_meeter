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
export default async function getCliquesWithHumans() {
    let returnedDict = {}
    const queryText = `
    SELECT party_people.ID as humanId, CONCAT(party_people.name, " ", party_people.surname) as full_name, cliques_names.id AS cliqueId, cliques_names.clique_name AS cliqueName, (6 * COALESCE(vg_count.visits_count, 0) + 3 * COALESCE(mh_count.meetings_count,0) + COALESCE(ec_count.events_count, 0) + 6 * COALESCE(trip_count.trips_count, 0) + COALESCE(wg_count.wedguest_count, 0) + 6 * COALESCE(wp_count.wedpart_count, 0) + 15 * COALESCE(groom_inv.groom_inv_count, 0) + 15 * COALESCE(bride_inv.bride_inv_count, 0) + 3 * COALESCE(groom_acc.groom_acc_count, 0) + 3 * COALESCE(bride_acc.bride_acc_count, 0))  AS points
    FROM party_people 
    JOIN cliques_names ON cliques_names.id = party_people.klika_id
    LEFT JOIN (
        SELECT meeting_human.human_id AS human_id, COUNT(meeting_human.human_id) AS meetings_count
        FROM meeting_human
        GROUP BY meeting_human.human_id
    ) AS mh_count ON mh_count.human_id = party_people.ID
    LEFT JOIN (
        SELECT visit_guest.guest_id AS human_id, COUNT(visit_guest.guest_id) AS visits_count
        FROM visit_guest
        GROUP BY visit_guest.guest_id
    ) AS vg_count ON vg_count.human_id = party_people.ID
    LEFT JOIN (
        SELECT event_companion.human_id as human_id, COUNT(event_companion.human_id) AS events_count
        FROM event_companion
        GROUP BY event_companion.human_id
    ) AS ec_count ON ec_count.human_id = party_people.ID
    LEFT JOIN (
        SELECT citybreak_companion.human_id AS human_id, COUNT(citybreak_companion.human_id) AS trips_count
        FROM citybreak_companion
        GROUP BY citybreak_companion.human_id
    ) AS trip_count ON trip_count.human_id = party_people.ID
    LEFT JOIN (
        SELECT wedding_guest.guest_id AS human_id, COUNT(wedding_guest.guest_id) AS wedguest_count
        FROM wedding_guest
        GROUP BY wedding_guest.guest_id
    ) AS wg_count ON wg_count.human_id = party_people.ID
    LEFT JOIN (
        SELECT weddings.partner_id AS human_id, COUNT(weddings.partner_id) AS wedpart_count
        FROM weddings
        GROUP BY weddings.partner_id
    ) AS wp_count ON wp_count.human_id = party_people.ID
    LEFT JOIN (
    	SELECT man_id AS human_id, COUNT(man_id) as groom_inv_count
        FROM weddings
        JOIN party_people pp ON weddings.man_id = pp.ID
        WHERE pp.klika_id !=5 and weddings.was_i_invited = 1
        GROUP BY man_id
    ) AS groom_inv ON groom_inv.human_id = party_people.ID
    LEFT JOIN (
    	SELECT woman_id AS human_id, COUNT(woman_id) as bride_inv_count
        FROM weddings
        JOIN party_people pp ON weddings.woman_id = pp.ID
        WHERE pp.klika_id !=5 and weddings.was_i_invited = 1
        GROUP BY woman_id
    ) AS bride_inv ON bride_inv.human_id = party_people.ID
    LEFT JOIN (
    	SELECT man_id AS human_id, COUNT(man_id) as groom_acc_count
        FROM weddings
        JOIN party_people pp ON weddings.man_id = pp.ID
        WHERE pp.klika_id = 5 and weddings.was_i_invited = 1
        GROUP BY man_id
    ) AS groom_acc ON groom_acc.human_id = party_people.ID
    LEFT JOIN (
    	SELECT woman_id AS human_id, COUNT(woman_id) as bride_acc_count
        FROM weddings
        JOIN party_people pp ON weddings.woman_id = pp.ID
        WHERE pp.klika_id = 5 and weddings.was_i_invited = 1
        GROUP BY woman_id
    ) AS bride_acc ON bride_acc.human_id = party_people.ID
    ORDER BY points DESC, surname, name;`
    const [queryResult] = await pool.query(queryText)
    for (let record of queryResult) {
        if (!(record.humanId)) {
            returnedDict[record.cliqueId] = {"cliqueName": record.cliqueName, "cliquePhoto": getCliquePhoto(record.cliqueId), "members": []}
        }
        else {
            if (record.cliqueId in returnedDict) {
                let humanToAdd = {"humanPhotoDir": getHumanPhotoDir(record.humanId), "humanName": record.full_name}
                returnedDict[record.cliqueId]["members"].push(humanToAdd)
            }
            else {
                returnedDict[record.cliqueId] = {"cliqueName": record.cliqueName, "cliquePhoto": getCliquePhoto(record.cliqueId), "members": [{"humanPhotoDir": getHumanPhotoDir(record.humanId), "humanName": record.full_name}]}
            }
        }
    }
    return returnedDict
}