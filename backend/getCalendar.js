import dotenv from 'dotenv'
import mysql from 'mysql2'
import createDateId from './multiuseFunctions/createDateId.js'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

function addDays(date, numberOfDays) {
    var result = new Date(date);
    result.setDate(result.getDate() + numberOfDays);
    return result;
  }


export default async function getCalendar(year) {
    let returnedDict = {}
    const weddingsQueryText = `SELECT date, man_id, woman_id, partner_id, info_after_hover FROM weddings WHERE YEAR(date) = ?`
    const [wedQuery] = await pool.query(weddingsQueryText, [year])
    for (let wedding of wedQuery) {
        const wedDate = wedding.date
        const wedDateId = createDateId(wedDate)
        if (wedding.partner_id != null) {
            const dictToAdd = {"class": "wedding", "title": wedding.info_after_hover, "partnerPhoto": getHumanPhotoDir(wedding.partner_id), "manPhoto": getHumanPhotoDir(wedding.man_id), "womanPhoto": getHumanPhotoDir(wedding.woman_id)}
            returnedDict[wedDateId] = dictToAdd
        }
        else {
            const dictToAdd = {"class": "wedding", "manPhoto": getHumanPhotoDir(wedding.man_id), "womanPhoto": getHumanPhotoDir(wedding.woman_id), "title": wedding.info_after_hover}
            returnedDict[wedDateId] = dictToAdd
        }
    }
    //Silent assumption - visits on a wedding day are not recorded, because on such a day people can, for example, visit you just for a stopover 
    const visitsQueryText = `SELECT visits.visit_date AS visitDate, visits.visit_duration AS visitDuration, visits.short_description AS visitShortDesc, party_people.id AS humanId
    FROM visit_guest
    LEFT JOIN visits ON visits.visit_id = visit_guest.visit_id
    LEFT JOIN party_people ON party_people.id = visit_guest.guest_id
    WHERE 
    YEAR(visits.visit_date) = ? 
    OR YEAR(DATE_ADD(visits.visit_date, INTERVAL visits.visit_duration - 1 DAY)) = ?`
    const [visitsReq] = await pool.query(visitsQueryText, [year, year])
    
    for (let record of visitsReq) {
        const visitStartDate = record.visitDate
        let dateId = createDateId(visitStartDate)
        if (!(returnedDict[dateId])) {
            returnedDict[dateId] = {"class": "visit","photos": [], "title": record.visitShortDesc}
        }
        returnedDict[dateId]["photos"].push(getHumanPhotoDir(record.humanId))
        if (record.visitDuration > 1) {
            for (let addedDays = 1; addedDays<record.visitDuration; addedDays+=1) {
                let newDate = addDays(visitStartDate, addedDays)
                const newDateId = createDateId(newDate)
                if (!(returnedDict[newDateId])) {
                    returnedDict[newDateId] = {"class": "visit","photos": [], "title": record.visitShortDesc}
                }
                returnedDict[newDateId]["photos"].push(getHumanPhotoDir(record.humanId))
            }
        }
    }
    const meetingsReqText = `SELECT meetings.meeting_date as meetingDate, 
    meetings.short_description as shortDesc, meeting_human.human_id AS humanId
    FROM meeting_human
    LEFT JOIN meetings ON meeting_human.meeting_id = meetings.ID
    WHERE YEAR(meetings.meeting_date) = ?
    `
    const [meetingReq] = await pool.query(meetingsReqText, [year])
    for (let record of meetingReq) {
        const recordDate = record.meetingDate
        const dateId = createDateId(recordDate)
        if (!(returnedDict[dateId])) {
            returnedDict[dateId] = {"class": "meeting", "photos": [getHumanPhotoDir(record.humanId)], "title": record.shortDesc}
        }
        else {
            if (returnedDict[dateId]["class"].includes("meeting")) {
                returnedDict[dateId]["photos"].push(getHumanPhotoDir(record.humanId))
            }
            else {
                returnedDict[dateId]["class"] = returnedDict[dateId]["class"] + "_meeting"
                returnedDict[dateId]["photos"].push(getHumanPhotoDir(record.humanId))
            }
        }
    }
    return returnedDict
}