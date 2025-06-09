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
	WHEN gender LIKE 'M' THEN id_husband.wife_name
    WHEN gender LIKE 'F' THEN id_wife.husband_name
END AS spouse_name
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
        LEFT JOIN (
        	SELECT man_id, woman_id, CONCAT(pp_husband.name, ' ', pp_husband.surname) AS husband_name,  CONCAT(pp_wife.name, ' ', 				pp_wife.surname) as wife_name
            FROM weddings
            JOIN party_people AS pp_husband ON pp_husband.id = man_id
            JOIN party_people AS pp_wife ON pp_wife.id = woman_id
        ) AS id_husband ON party_people.ID = id_husband.man_id
        LEFT JOIN (
        	SELECT man_id, woman_id, CONCAT(pp_husband.name, ' ', pp_husband.surname) AS husband_name,  CONCAT(pp_wife.name, ' ', 				pp_wife.surname) as wife_name
            FROM weddings
            JOIN party_people AS pp_husband ON pp_husband.id = man_id
            JOIN party_people AS pp_wife ON pp_wife.id = woman_id
        ) AS id_wife ON party_people.ID = id_wife.woman_id
        JOIN cliques_names ON party_people.klika_id = cliques_names.id
        WHERE party_people.id = ?;`
        const [getReq] = await pool.query(requestText, [humanId])
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
            "cliqueName": getReq[0]["clique_name"],
            "spouse_id": getReq[0]["spouse_id"],
            "spouse_name": getReq[0]["spouse_name"]
        }


        //I separated this part of a query to make it easier to manage
        const lastInteractionQueryText = `
        WITH rankedVisits AS (
            SELECT visit_guest.guest_id AS humanId, 
            visits.visit_date AS visitsDate,
            visits.short_description AS interactionTitle,
            ROW_NUMBER() OVER (PARTITION BY visit_guest.guest_id ORDER BY visits.visit_date DESC) AS visitRank
            FROM visit_guest
            JOIN visits ON visits.visit_id = visit_guest.visit_id
            WHERE visits.visit_date <= NOW()
        ),
        rankedMeetings AS (
            SELECT meeting_human.human_id AS humanId,
            meetings.meeting_date AS meetingDate,
            CONCAT(meetings.short_description, ' w miejscu ', meetings.Place) AS interactionTitle,
            ROW_NUMBER() OVER (PARTITION BY meeting_human.human_id ORDER BY meetings.meeting_date DESC) AS meetingsRank
            FROM meeting_human
            JOIN meetings ON meeting_human.meeting_id = meetings.ID
            WHERE meetings.meeting_date < NOW()
        ),
        rankedEvents AS (
            SELECT event_companion.human_id AS humanId, events.meLeavingDate AS lastEventDate, CONCAT(events.nameOfEvent, ' w miejscu ', events.place) AS interactionTitle,
            ROW_NUMBER() OVER (PARTITION BY event_companion.human_id ORDER BY events.dateStop DESC) AS eventsRank
            FROM event_companion
            JOIN events ON event_companion.event_id = events.id
            WHERE events.meComingDate < NOW()
        ),
        rankedTrips AS (
            SELECT citybreak_companion.human_id AS humanId, citybreaks.Date_stop AS lastTripDate, citybreaks.Place AS interactionTitle, 
            ROW_NUMBER() OVER (PARTITION BY citybreak_companion.human_id ORDER BY citybreaks.Date_stop DESC) AS tripsRank
            FROM citybreak_companion
            JOIN citybreaks ON citybreaks.ID = citybreak_companion.citybreak_id
            WHERE citybreaks.Date_start < NOW()
        )
        SELECT CONCAT(name, ' ', surname) AS fullName, rankedVisits.visitsDate AS lastVisitDate, rankedVisits.interactionTitle AS lastVisitDesc, rankedMeetings.meetingDate AS lastMeetingDate, rankedMeetings.interactionTitle AS lastMeetingTitle, rankedEvents.lastEventDate AS lastEventDate, rankedEvents.interactionTitle AS lastEventTitle, rankedTrips.lastTripDate AS lastTripDate, rankedTrips.interactionTitle AS lastTripTitle
        FROM party_people
        LEFT JOIN rankedVisits ON party_people.ID = rankedVisits.humanId AND rankedVisits.visitRank = 1
        LEFT JOIN rankedMeetings ON party_people.ID = rankedMeetings.humanId AND rankedMeetings.meetingsRank = 1
        LEFT JOIN rankedEvents ON rankedEvents.humanId = party_people.ID AND rankedEvents.eventsRank = 1
        LEFT JOIN rankedTrips ON rankedTrips.humanId = party_people.ID AND rankedTrips.tripsRank = 1;
        `

        return returnedDict
}