import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
import createDateString from './multiuseFunctions/dateToString.js'
import getDefinedPlacesNumber from './getDefinedPlacesNumber.js'
import getHumanSuperpowers from './getHumanSuperpowers.js'
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
			CASE 
    			WHEN NOW() BETWEEN visits.visit_date AND ADDDATE(visits.visit_date, visits.visit_duration - 1) THEN NOW()
    		ELSE ADDDATE(visits.visit_date, visits.visit_duration - 1) END AS visitsDate,
            visits.short_description AS interactionTitle,
            ROW_NUMBER() OVER (PARTITION BY visit_guest.guest_id ORDER BY visits.visit_date DESC) AS visitRank
            FROM visit_guest
            JOIN visits ON visits.visit_id = visit_guest.visit_id
    		-- I only take visits that already started
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
            SELECT event_companion.human_id AS humanId, 
            CASE WHEN NOW() BETWEEN events.meComingDate AND events.meLeavingDate THEN NOW()
            ELSE events.meLeavingDate END AS lastEventDate,
            CONCAT(events.nameOfEvent, ' w miejscu ', events.place) AS interactionTitle,
            ROW_NUMBER() OVER (PARTITION BY event_companion.human_id ORDER BY events.dateStop DESC) AS eventsRank
            FROM event_companion
            JOIN events ON event_companion.event_id = events.id
            WHERE events.meComingDate < NOW()
        ),
        rankedTrips AS (
            SELECT citybreak_companion.human_id AS humanId, 
            CASE
            WHEN NOW() BETWEEN citybreaks.Date_start AND citybreaks.Date_stop THEN NOW()
            ELSE citybreaks.Date_stop END AS lastTripDate, 
            citybreaks.Place AS interactionTitle, 
            ROW_NUMBER() OVER (PARTITION BY citybreak_companion.human_id ORDER BY citybreaks.Date_stop DESC) AS tripsRank
            FROM citybreak_companion
            JOIN citybreaks ON citybreaks.ID = citybreak_companion.citybreak_id
            WHERE citybreaks.Date_start < NOW()
        ),
        weddingsHosts AS (
            SELECT man_id, woman_id, weddings.date, weddings.info_after_hover AS interactionTitle
            -- I don't need row_number() here because I have no friends that married twice. Yet.
            FROM weddings
            WHERE weddings.date <= NOW() AND weddings.was_i_invited = 1
        ),
        coweds AS (
        	SELECT wedding_guest.guest_id AS humanId, weddings.date AS lastCowed, weddings.info_after_hover AS interactionTitle,
            ROW_NUMBER() OVER (PARTITION BY wedding_guest.guest_id ORDER BY weddings.date DESC) AS cowedsRank
            FROM wedding_guest
            JOIN weddings ON wedding_guest.wedding_id = weddings.id
            WHERE weddings.date <= NOW() AND weddings.was_i_invited = 1
        ),
        collective_data AS (SELECT party_people.id,  CONCAT(name, ' ', surname) AS fullName, COALESCE(rankedVisits.visitsDate, '1997-01-01') AS lastVisitDate, rankedVisits.interactionTitle AS lastVisitDesc, COALESCE(rankedMeetings.meetingDate, '1997-01-01') AS lastMeetingDate, rankedMeetings.interactionTitle AS lastMeetingTitle, COALESCE(rankedEvents.lastEventDate, '1997-01-01') AS lastEventDate, rankedEvents.interactionTitle AS lastEventTitle, COALESCE(rankedTrips.lastTripDate, '1997-01-01') AS lastTripDate, rankedTrips.interactionTitle AS lastTripTitle, COALESCE(COALESCE(wh_husband.date, wh_wife.date), '1997-01-01') AS wedding_date, COALESCE(wh_husband.interactionTitle, wh_wife.interactionTitle) AS weddingTitle, COALESCE(coweds.lastCowed, '1997-01-01') AS lastCowedDate, coweds.interactionTitle AS lastCowedTitle
        FROM party_people
        LEFT JOIN rankedVisits ON party_people.ID = rankedVisits.humanId AND rankedVisits.visitRank = 1
        LEFT JOIN rankedMeetings ON party_people.ID = rankedMeetings.humanId AND rankedMeetings.meetingsRank = 1
        LEFT JOIN rankedEvents ON rankedEvents.humanId = party_people.ID AND rankedEvents.eventsRank = 1
        LEFT JOIN rankedTrips ON rankedTrips.humanId = party_people.ID AND rankedTrips.tripsRank = 1
        LEFT JOIN weddingsHosts AS wh_husband ON wh_husband.man_id = party_people.ID
        LEFT JOIN weddingsHosts AS wh_wife ON wh_wife.woman_id = party_people.ID
        LEFT JOIN coweds ON coweds.humanId = party_people.ID AND coweds.cowedsRank = 1)
        SELECT fullName,
        CASE
        	WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastVisitDate THEN lastVisitDate
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastMeetingDate THEN lastMeetingDate
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastEventDate THEN lastEventDate
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastTripDate THEN lastTripDate
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = wedding_date THEN wedding_date
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastCowedDate THEN lastCowedDate
        END AS lastInteractionDate,
        CASE
        	WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastVisitDate THEN lastVisitDesc
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastMeetingDate THEN lastMeetingTitle
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastEventDate THEN lastEventTitle
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastTripDate THEN lastTripTitle
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = wedding_date THEN weddingTitle
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastCowedDate THEN lastCowedTitle
        END AS lastInteractionDesc,
        CASE
        	WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastVisitDate THEN DATEDIFF(NOW(), lastVisitDate)
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastMeetingDate THEN DATEDIFF(NOW(), lastMeetingDate)
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastEventDate THEN DATEDIFF(NOW(), lastEventDate)
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastTripDate THEN DATEDIFF(NOW(), lastTripDate)
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = wedding_date THEN DATEDIFF(NOW(), wedding_date)
            WHEN GREATEST(lastVisitDate, lastMeetingDate, lastEventDate, lastTripDate, wedding_date, lastCowedDate) = lastCowedDate THEN DATEDIFF(NOW(), lastCowedDate)      	
        END AS daysAgo
        FROM collective_data
        WHERE id = ?;
        `
        const [lastInteractionReq] = await pool.query(lastInteractionQueryText, [humanId])
        if (lastInteractionReq[0].daysAgo == 0) {
            returnedDict["lastSeen"] = `Ostatni raz widzieliście się dzisiaj, do czego pretekstem jest ${lastInteractionReq[0].lastInteractionDesc}.\n`
        }
        else if (lastInteractionReq[0].daysAgo == 1) {
            returnedDict["lastSeen"] = `Ostatni raz widzieliście się wczoraj (${createDateString(lastInteractionReq[0].lastInteractionDate)}), do czego pretekstem jest ${lastInteractionReq[0].lastInteractionDesc}.\n`
        }
        else if (lastInteractionReq[0].daysAgo > 1 && lastInteractionReq[0].daysAgo < 6000){
            returnedDict["lastSeen"] = `Ostatni raz widzieliście się ${lastInteractionReq[0].daysAgo} dni temu. Pretekstem do tego spotkania było ${lastInteractionReq[0].lastInteractionDesc}. Miało to miejsce ${createDateString(lastInteractionReq[0].lastInteractionDate)}.\n`
        }
        else {
            returnedDict["lastSeen"] = `W bazie nie ma danych o spotkaniach z tą osobą.`
        }
        const notSeeingStats = `
        WITH all_interactions AS (
            SELECT meetings.meeting_date AS startDate, meetings.meeting_date AS stopDate, meeting_human.human_id AS humanId
            FROM meeting_human
            JOIN meetings ON meeting_human.meeting_id = meetings.ID
            WHERE YEAR(meetings.meeting_date) > 2023
            UNION
            SELECT visits.visit_date AS startDate, ADDDATE(visits.visit_date, visits.visit_duration-1), visit_guest.guest_id AS humanId
            FROM visit_guest
            JOIN visits ON visit_guest.visit_id = visits.visit_id
            WHERE YEAR(visits.visit_date) > 2023
            UNION
            SELECT events.meComingDate AS startDate, events.meLeavingDate AS stopDate, event_companion.human_id AS humanId
            FROM event_companion
            JOIN events ON event_companion.event_id = events.id
            WHERE YEAR(events.meComingDate) > 2023
            UNION
            SELECT weddings.date AS startDate, ADDDATE(weddings.date, 1) AS stopDate, wedding_guest.guest_id AS humanId
            FROM wedding_guest
            JOIN weddings ON wedding_guest.wedding_id = weddings.id
            WHERE YEAR(weddings.date) > 2023
            UNION
            SELECT weddings.date AS startDate, ADDDATE(weddings.date, 1) AS stopDate, weddings.man_id AS humanId
            FROM weddings
            WHERE YEAR(weddings.date) > 2023
            UNION
            SELECT weddings.date AS startDate, ADDDATE(weddings.date, 1) AS stopDate, weddings.woman_id AS humanId
            FROM weddings
            WHERE YEAR(weddings.date) > 2023
            UNION
            SELECT citybreaks.Date_start AS startDate, citybreaks.Date_stop AS stopDate, citybreak_companion.human_id AS humanId
            FROM citybreak_companion
            JOIN citybreaks ON citybreak_companion.citybreak_id = citybreaks.ID
            WHERE YEAR(citybreaks.Date_start) > 2023
        ),
        differences AS (
        SELECT startDate,
                DATEDIFF(startDate, LAG(stopDate) OVER (ORDER BY stopDate)) AS notSeeingPeriod
        FROM (
            SELECT startDate, stopDate
            FROM all_interactions
            WHERE humanId = ?
        ) AS person_interactions
        )
        SELECT ROUND(AVG(notSeeingPeriod), 2) AS averageNotSeeing, ROUND(STD(notSeeingPeriod), 2) AS notSeeingStd, MAX(notSeeingPeriod) AS notSeeingMax
        FROM differences
        WHERE startDate >= '2024-05-01' AND notSeeingPeriod > 0;
        `
        const [notSeeingReq] =  await pool.query(notSeeingStats, [humanId])
        let averageNotSeeing = parseFloat(notSeeingReq[0]["averageNotSeeing"])
        let notSeeingStd = parseFloat(notSeeingReq[0]["notSeeingStd"])
        let notSeeingSum = averageNotSeeing + notSeeingStd
        //std = 0 when there are only two interactions and calculating those stats makes no sense
        if (notSeeingStd > 0) {
            if (notSeeingSum < lastInteractionReq[0].daysAgo) {
                returnedDict["lastSeen"] += `Biorac pod uwagę okres od 1 stycznia 2024, widujecie się co ${notSeeingReq[0].averageNotSeeing} ± ${notSeeingReq[0]["notSeeingStd"]} dni. Wypadałoby się spotkać, bo haniebnie zaniżasz statystyki.`
            }
            else {
                returnedDict["lastSeen"] += `Biorac pod uwagę okres od 1 stycznia 2024, widujecie się co ${notSeeingReq[0].averageNotSeeing} ± ${notSeeingReq[0]["notSeeingStd"]} dni.`
            }
        }

        const placesCategoriesQueryText = `
        WITH meeting_categories AS (
                    SELECT p.category
                    FROM meeting_human mh
                    JOIN meetings m ON m.ID = mh.meeting_id
                    JOIN places p ON p.id = m.place_id
                    WHERE mh.human_id = ?
                    AND m.place_id IS NOT NULL
                ),
        visit_categories AS (
                    SELECT p.category
                    FROM visit_guest vg
                    JOIN visits v ON v.visit_id = vg.visit_id
                    JOIN places p ON p.id = v.place_id
                    WHERE vg.guest_id = ?
                    AND v.place_id IS NOT NULL
                ),
        event_categories AS (
                    SELECT p.category
                    FROM event_companion ec
                    JOIN events e ON ec.event_id = e.id
                    JOIN places p ON p.id = e.place_id
                    WHERE ec.human_id = ?
                    AND e.place_id IS NOT NULL
                ),
        wedding_party_heros_place_id AS (
            SELECT p.category
            FROM weddings w
            JOIN places p ON p.id = w.party_place_id
            WHERE w.man_id = ? OR w.woman_id = ? OR w.partner_id = ?
            AND w.party_place_id IS NOT NULL
            AND w.was_i_invited = 1
        ),
        wedding_guest_place_id AS (
            SELECT p.category
            FROM wedding_guest wg
            JOIN weddings w ON wg.wedding_id = w.id
            JOIN places p ON p.id = w.party_place_id
            WHERE wg.guest_id = ?
            AND w.party_place_id IS NOT NULL
            AND w.was_i_invited = 1
        ),
        all_interactions AS (
            SELECT category FROM meeting_categories
            UNION ALL
            SELECT category FROM visit_categories
            UNION ALL
            SELECT category FROM event_categories
            UNION ALL
            SELECT category FROM wedding_party_heros_place_id
            UNION ALL
            SELECT category FROM wedding_guest_place_id
        )
        SELECT category, COUNT(*) AS category_count
        FROM all_interactions
        GROUP BY category
        ORDER BY category_count DESC;
        `
        const [placesCategoriesQuery] = await pool.query(placesCategoriesQueryText, [humanId, humanId, humanId, humanId, humanId, humanId, humanId])
        returnedDict["interactionPlacesCategories"] = placesCategoriesQuery       
        
        try {
            const numberOfDefinedPlaces = await getDefinedPlacesNumber(humanId)
            returnedDict["interactionPlacesNumber"] = numberOfDefinedPlaces
        }
        catch (error) {
            console.log(error)
        }
        try {
            const superpowersToAdd = await getHumanSuperpowers(humanId)
            console.log(superpowersToAdd)
            returnedDict["superpowers"] = superpowersToAdd
        }
        catch (error) {
            console.log(`Nie udalo się pobrać supermocy dla osoby o ID ${humanId}.`)
        }

        return returnedDict
}
//getBasicInfoForModal(41)