import dotenv from 'dotenv'
import mysql from 'mysql2'
import nodeplotlib from 'nodeplotlib'
const { plot, stack, Layout } = nodeplotlib
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getRelatiogramData(humanId) {
    const queryText = `
    WITH RECURSIVE all_months AS (
        SELECT DATE('2023-12-01') AS month_date
        UNION ALL
        SELECT DATE_ADD(month_date, INTERVAL 1 MONTH)
        FROM all_months
        WHERE DATE_ADD(month_date, INTERVAL 1 MONTH) < CURRENT_DATE()
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
    ),
    event_human_count AS (
        SELECT DATE_FORMAT(events.meComingDate, '%Y-%m') AS formated_date, event_companion.human_id AS human_id, COUNT(human_id) AS events_in_month
        FROM event_companion
        JOIN events ON event_companion.event_id = events.id
        GROUP BY event_companion.human_id, DATE_FORMAT(events.meComingDate, '%Y-%m')
    ),
    huswed_human_count AS (
        SELECT DATE_FORMAT(weddings.date, '%Y-%m') AS formated_date, man_id AS human_id, COUNT(man_id) AS huswed_in_month
        FROM weddings
        JOIN party_people AS pp_husband ON pp_husband.ID = weddings.man_id
        WHERE pp_husband.klika_id != 5 AND was_i_invited = 1
        GROUP BY human_id
    ),
    huswed_acc_human_count AS (
        SELECT DATE_FORMAT(weddings.date, '%Y-%m') AS formated_date, man_id AS human_id, COUNT(man_id) AS huswed_in_month
        FROM weddings
        JOIN party_people AS pp_husband ON pp_husband.ID = weddings.man_id
        WHERE pp_husband.klika_id = 5 AND was_i_invited = 1
        GROUP BY human_id
    ),
    wifewed_human_count AS (
        SELECT DATE_FORMAT(weddings.date, '%Y-%m') AS formated_date, woman_id AS human_id, COUNT(woman_id) AS wifewed_in_month
        FROM weddings
        JOIN party_people AS pp_wife ON pp_wife.ID = weddings.woman_id
        WHERE pp_wife.klika_id != 5 AND was_i_invited = 1
        GROUP BY human_id
    ),
    wifewed_acc_human_count AS (
        SELECT DATE_FORMAT(weddings.date, '%Y-%m') AS formated_date, woman_id AS human_id, COUNT(woman_id) AS wifewed_in_month
        FROM weddings
        JOIN party_people AS pp_wife ON pp_wife.ID = weddings.woman_id
        WHERE pp_wife.klika_id = 5 AND was_i_invited = 1
        GROUP BY human_id
    ),
    trips_human_count AS (
    	SELECT DATE_FORMAT(citybreaks.Date_start, '%Y-%m') AS formated_date, citybreak_companion.human_id AS human_id, COUNT(citybreak_companion.human_id) AS trips_in_month
        FROM citybreak_companion
        JOIN citybreaks ON citybreaks.ID = citybreak_companion.citybreak_id
        GROUP BY citybreak_companion.human_id, DATE_FORMAT(citybreaks.Date_start, '%Y-%m')
    ),
    cowed_human_count AS (
    	SELECT DATE_FORMAT(weddings.date, '%Y-%m') AS formated_date, wedding_guest.guest_id AS human_id, 
        COUNT(guest_id) AS coweds_in_month
        FROM wedding_guest
        JOIN weddings ON wedding_guest.wedding_id = weddings.id
        GROUP BY wedding_guest.guest_id, DATE_FORMAT(weddings.date, '%Y-%m')
    )
    SELECT 
        party_people.id, 
        CONCAT(party_people.name, ' ', party_people.surname) AS full_name,
        DATE_FORMAT(all_months.month_date, '%Y-%m') AS formated_date, 
        COALESCE(visit_human_count.visits_in_month, 0) AS visits_in_month,
        COALESCE(meeting_human_count.meetings_in_month, 0) AS meetings_in_month,
        COALESCE(event_human_count.events_in_month, 0) AS events_in_month,
        COALESCE(huswed_human_count.huswed_in_month, 0) AS huswed_in_month,
        COALESCE(huswed_acc_human_count.huswed_in_month, 0) AS huswed_acc_in_month,
        COALESCE(wifewed_human_count.wifewed_in_month, 0) AS wifewed_human_count,
        COALESCE(wifewed_acc_human_count.wifewed_in_month, 0) AS wifewed_acc_human_count,
        COALESCE(trips_human_count.trips_in_month, 0) AS trips_in_mont,
        COALESCE(cowed_human_count.coweds_in_month, 0) AS coweds_in_month,
        SUM(COALESCE(visit_human_count.visits_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) AS visits_so_far,
        SUM(COALESCE(meeting_human_count.meetings_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) AS meetings_so_far,
        SUM(COALESCE(event_human_count.events_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) AS events_so_far,
        SUM(COALESCE(trips_human_count.trips_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING) AS trips_so_far,
        SUM(COALESCE(huswed_human_count.huswed_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) AS husweds_so_far,
        SUM(COALESCE(huswed_acc_human_count.huswed_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) AS husweds_acc_so_far,
        SUM(COALESCE(wifewed_human_count.wifewed_in_month, 0)) OVER (
        	PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) AS wifeweds_so_far,
        SUM(COALESCE(wifewed_acc_human_count.wifewed_in_month, 0)) OVER (
        	PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        )  AS wifeweds_acc_so_far,
        SUM(COALESCE(cowed_human_count.coweds_in_month, 0)) OVER (
        	PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) AS coweds_so_far,
        6 * SUM(COALESCE(visit_human_count.visits_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 3 * SUM(COALESCE(meeting_human_count.meetings_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 1* SUM(COALESCE(event_human_count.events_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 15 * SUM(COALESCE(huswed_human_count.huswed_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 3 * SUM(COALESCE(huswed_acc_human_count.huswed_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 15 * SUM(COALESCE(wifewed_human_count.wifewed_in_month, 0)) OVER (
        	PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 3 * SUM(COALESCE(wifewed_acc_human_count.wifewed_in_month, 0)) OVER (
        	PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 6 *  SUM(COALESCE(trips_human_count.trips_in_month, 0)) OVER (
            PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        ) + 1 * SUM(COALESCE(cowed_human_count.coweds_in_month, 0)) OVER (
        	PARTITION BY party_people.id 
            ORDER BY all_months.month_date
            ROWS UNBOUNDED PRECEDING
        )
        AS points_so_far
    FROM party_people
    CROSS JOIN all_months
    LEFT JOIN visit_human_count 
        ON visit_human_count.human_id = party_people.ID 
        AND visit_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN meeting_human_count ON
        meeting_human_count.human_id = party_people.ID
        AND meeting_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN event_human_count ON
        event_human_count.human_id = party_people.ID
        AND event_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN huswed_human_count ON 
        huswed_human_count.human_id = party_people.ID
        AND huswed_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN huswed_acc_human_count ON 
        huswed_acc_human_count.human_id = party_people.ID
        AND huswed_acc_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN wifewed_human_count ON
        wifewed_human_count.human_id = party_people.ID
        AND wifewed_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN wifewed_acc_human_count ON
    	wifewed_acc_human_count.human_id = party_people.ID
        AND wifewed_acc_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN trips_human_count ON
    	trips_human_count.human_id = party_people.ID
        AND trips_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    LEFT JOIN cowed_human_count ON
    	cowed_human_count.human_id = party_people.ID
        AND cowed_human_count.formated_date = DATE_FORMAT(all_months.month_date, '%Y-%m')
    WHERE party_people.ID IN (?);
    `
    let dataDict = {}
    const [relatiogramData] = await pool.query(queryText, [humanId])
    for (let record of relatiogramData) {
        if (!(record.id in dataDict)) {

            dataDict[record.id] = {"name": record.full_name, "points": {[record["formated_date"]]: record.points_so_far}}
        }
        else {
            dataDict[record.id]["points"][record.formated_date] = record.points_so_far
        }
    }
    let lines = []
    for (let [ humanId, humanData ] of Object.entries(dataDict)) {
        const newLineX = Object.keys(humanData["points"])
        const newLineY = Object.values(humanData["points"])
        let line = {
            "x": newLineX,
            "y": newLineY,
            "type": "line",
            "name": humanData.name
        }
        lines.push(line)
    }
    let layout = {
        "xaxis": {
            "title": "Miesiąc",
                titlefont: {
                    size: 18,
                    weight: 700
                },
                tickfont: {
                    size:14,
                    weight: 700
                }
        },
        "yaxis": {
            "title": "Punkty",
                titlefont: {
                    size: 18,
                    weight: 700
                },
                tickfont: {
                    size:14,
                    weight: 700
                },
                rangemode: 'tozero'
        },
        "legend": {
            font: {
                size: 14,
                weight: 700
            }
        }
    }
    return { data: lines, layout }; 
}

