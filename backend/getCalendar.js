import dotenv from 'dotenv'
import mysql from 'mysql2'
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";
import createDateId from './multiuseFunctions/createDateId.js'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function addDays(date, numberOfDays) {
    var result = new Date(date);
    result.setDate(result.getDate() + numberOfDays);
    return result;
  }
function getEventPhotoFromName(photoName) {
    const photoDir = path.join(__dirname, "events", photoName)
    return photoDir
}

function getEventPhotoFromId(eventId) {
    const eventPhotosDir = path.join(__dirname, "events")
    let returnedDir = ""
    for (let fileName of fs.linkSync(eventPhotosDir)) {
        const nameWoExtension = fileName.split(".")[0]
        if (nameWoExtension == eventId) {
            returnedDir = path.join(eventPhotosDir, fileName)
        }
    }
    return returnedDir
}

export default async function getCalendar(year) {
    let returnedDict = {}
    const weddingsQueryText = `SELECT date, man_id, woman_id, partner_id, info_after_hover FROM weddings WHERE YEAR(date) = ?`
    const [wedQuery] = await pool.query(weddingsQueryText, [year])
    for (let wedding of wedQuery) {
        const wedDate = wedding.date
        const wedDateId = createDateId(wedDate)
        if (wedding.partner_id != null) {
            const dictToAdd = {"interactionClass": "wedding", "title": wedding.info_after_hover, "partnerPhoto": getHumanPhotoDir(wedding.partner_id), "manPhoto": getHumanPhotoDir(wedding.man_id), "womanPhoto": getHumanPhotoDir(wedding.woman_id)}
            returnedDict[wedDateId] = dictToAdd
        }
        else {
            const dictToAdd = {"interactionClass": "wedding", "manPhoto": getHumanPhotoDir(wedding.man_id), "womanPhoto": getHumanPhotoDir(wedding.woman_id), "title": wedding.info_after_hover}
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
            returnedDict[dateId] = {"interactionClass": "visit","photos": [], "title": record.visitShortDesc}
        }
        returnedDict[dateId]["photos"].push(getHumanPhotoDir(record.humanId))
        if (record.visitDuration > 1) {
            for (let addedDays = 1; addedDays<record.visitDuration; addedDays+=1) {
                let newDate = addDays(visitStartDate, addedDays)
                const newDateId = createDateId(newDate)
                if (!(returnedDict[newDateId])) {
                    returnedDict[newDateId] = {"interactionClass": "visit","photos": [], "title": record.visitShortDesc}
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
            returnedDict[dateId] = {"interactionClass": "meeting", "photos": [getHumanPhotoDir(record.humanId)], "title": record.shortDesc}
        }
        else {
            if (returnedDict[dateId]["interactionClass"].includes("meeting")) {
                returnedDict[dateId]["photos"].push(getHumanPhotoDir(record.humanId))
            }
            else {
                returnedDict[dateId]["interactionClass"] = returnedDict[dateId]["interactionClass"] + "_meeting"
                returnedDict[dateId]["photos"].push(getHumanPhotoDir(record.humanId))
            }
        }
    }
    const eventsReqText = `SELECT events.id as event_id, events.nameOfEvent as eventName, events.meComingDate as comingDate, 
    events.meLeavingDate as leavingDate, events.place as place, events.Generic_photo as generic_photo, event_companion.human_id as human_id
    FROM events
    LEFT JOIN event_companion ON events.id = event_companion.event_id
    WHERE YEAR(events.meComingDate) = ? OR YEAR(events.meLeavingDate) = ?;`
    const [eventsReq] = await pool.query(eventsReqText, [year, year])

    for (let record of eventsReq) {
        let currentDay = record.comingDate
        let photosToAdd = []
        if (record.generic_photo.length > 3) {
            photosToAdd.push(getEventPhotoFromName(record.generic_photo))
        }
        else {
            photosToAdd.push(getEventPhotoFromId(record.event_id))
        }
        if (record.human_id != null) {
            photosToAdd.push(getHumanPhotoDir(record.human_id))
        }
        while (createDateId(currentDay) != createDateId(addDays(record.leavingDate, 1))) {
            let currentDayId = createDateId(currentDay)
            if (!(currentDayId in returnedDict)) {
                returnedDict[currentDayId] = {"interactionClass": "event", "photos": photosToAdd, "title": record.eventName}
            }
            else {
                for (let photoDirectory of photosToAdd) {
                    if (!(returnedDict[currentDayId]["interactionClass"].includes("event"))) {
                        returnedDict[currentDayId]["interactionClass"] += "_event"
                    }
                    if (!(returnedDict[currentDayId]["photos"].includes(photoDirectory))) {
                        returnedDict[currentDayId]["photos"].push(photoDirectory)
                    }
                }
            }
            currentDay = addDays(currentDay, 1)
        }
    }
    return returnedDict
    }
getCalendar(2025)