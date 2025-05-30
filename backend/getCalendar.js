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
    for (let fileName of fs.readdirSync(eventPhotosDir)) {
        const nameWoExtension = fileName.split(".")[0]
        if (nameWoExtension == eventId) {
            returnedDir = path.join(eventPhotosDir, fileName)
        }
    }
    return returnedDir
}

export default async function getCalendar(year) {
    let returnedDict = {}
    const weddingsQueryText = `SELECT date, man_id, woman_id, partner_id, info_after_hover FROM weddings WHERE YEAR(date) = ? AND was_i_invited = 1`
    const [wedQuery] = await pool.query(weddingsQueryText, [year])
    for (let wedding of wedQuery) {
        const wedDate = wedding.date
        const wedDateId = createDateId(wedDate)
        if (wedding.partner_id != null) {
            const dictToAdd = {"interactionClass": "wedding", "title": wedding.info_after_hover, "partnerPhoto": getHumanPhotoDir(wedding.partner_id), "manPhoto": getHumanPhotoDir(wedding.man_id), "womanPhoto": getHumanPhotoDir(wedding.woman_id)}
            returnedDict[wedDateId] = dictToAdd
        }
        else {
            const dictToAdd = {"interactionClass": "wedding", "manPhoto": getHumanPhotoDir(wedding.man_id), "womanPhoto": getHumanPhotoDir(wedding.woman_id), "title": wedding.info_after_hover, "computedTitle": wedding.info_after_hover}
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
        let visitAddedDate = record.visitDate
        let dateId = createDateId(visitAddedDate)
        if (!(returnedDict[dateId])) {
            returnedDict[dateId] = {"interactionClass": "visit","photos": [], "title": record.visitShortDesc, "titlesDict": {[visitAddedDate.toISOString()]: record.visitShortDesc}}
        }
        else {
            if (!(Object.values(returnedDict[dateId]["titlesDict"]).includes(record.visitShortDesc))) {
                while (Object.keys(returnedDict[dateId]["titlesDict"]).includes(visitAddedDate.toISOString())) {
                    visitAddedDate = new Date(visitAddedDate.getTime() + 5000)
                }
                returnedDict[dateId]["titlesDict"][visitAddedDate.toISOString()] = record.visitShortDesc
            }
        }
        returnedDict[dateId]["photos"].push(getHumanPhotoDir(record.humanId))
        if (record.visitDuration > 1) {
            for (let addedDays = 1; addedDays<record.visitDuration; addedDays+=1) {
                let newDate = addDays(visitAddedDate, addedDays)
                const newDateId = createDateId(newDate)
                if (!(returnedDict[newDateId])) {
                    returnedDict[newDateId] = {"interactionClass": "visit","photos": [], "title": record.visitShortDesc, "titlesDict": {[visitAddedDate.toISOString()]: record.visitShortDesc}}
                }
                else {
                    if (!(Object.values(returnedDict[dateId]["titlesDict"]).includes(record.visitShortDesc))) {
                        while (Object.keys(returnedDict[dateId]["titlesDict"]).includes(newDate.toISOString())) {
                            newDate = new Date(newDate.getTime() + 5000)
                        }
                        returnedDict[dateId]["titlesDict"][newDate.toISOString()] = record.visitShortDesc
                    }
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
        let recordDate = new Date(record.meetingDate);
        const dateId = createDateId(recordDate)
        if (!(returnedDict[dateId])) {
            returnedDict[dateId] = {"interactionClass": "meeting", "photos": [getHumanPhotoDir(record.humanId)], "title": record.shortDesc, "titlesDict": {[recordDate.toISOString()]: record.shortDesc}}
        }
        //if date is already in the returnedDict
        else {
            const descriptionsSoFar= Object.values(returnedDict[dateId]["titlesDict"])
            if (!(descriptionsSoFar.includes(record.shortDesc))) {
                while(Object.keys(returnedDict[dateId]["titlesDict"]).includes(recordDate.toISOString())) {
                    recordDate = new Date(recordDate.getTime() + 5000)
                }
                returnedDict[dateId]["titlesDict"][recordDate.toISOString()] = record.shortDesc
            }

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
        let currentDatetime = record.comingDate
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
        while (createDateId(currentDatetime) != createDateId(addDays(record.leavingDate, 1))) {
            let currentDatetimeId = createDateId(currentDatetime)
            if (!(currentDatetimeId in returnedDict)) {
                returnedDict[currentDatetimeId] = {"interactionClass": "event", "photos": photosToAdd, "title": record.eventName, "titlesDict": {[currentDatetime.toISOString()]: record.eventName}}
            }
            else {
                //if a given eventName is not in titlesDict
                if (!(Object.values(returnedDict[currentDatetimeId]["titlesDict"]).includes(record.eventName))) {
                    while(Object.keys(returnedDict[currentDatetimeId]["titlesDict"]).includes(currentDatetime.toISOString())) {
                        currentDatetime = new Date(currentDatetime.getTime() + 5000)
                    }
                    
                    returnedDict[currentDatetimeId]["titlesDict"][currentDatetime.toISOString()] = record.eventName
                }
                for (let photoDirectory of photosToAdd) {
                    if (!(returnedDict[currentDatetimeId]["interactionClass"].includes("event"))) {
                        returnedDict[currentDatetimeId]["interactionClass"] += "_event"
                    }
                    if (!(returnedDict[currentDatetimeId]["photos"].includes(photoDirectory))) {
                        returnedDict[currentDatetimeId]["photos"].push(photoDirectory)
                    }
                }
            }
            currentDatetime = addDays(currentDatetime, 1)
        }
    }
    
    const tripsReqText = `
    SELECT citybreaks.ID AS id, citybreaks.Place as tripName, citybreaks.Date_start as dateStart, citybreaks.Date_stop AS dateStop, citybreak_companion.human_id AS humanId
    FROM citybreaks
    JOIN citybreak_companion ON citybreak_companion.citybreak_id = citybreaks.ID
    WHERE YEAR(citybreaks.Date_start) = ? OR YEAR(citybreaks.Date_stop) = ?;
    `
    const [tripsQuery] = await pool.query(tripsReqText, [year, year])

    for (let trip of tripsQuery) {
        console.log(trip)
        let photosToAdd = []
        const tripPhotosDir = path.join(__dirname, "trips", trip.id.toString())
        const photosList = fs.readdirSync(tripPhotosDir)
        const humanPhotoDir = getHumanPhotoDir(trip.humanId)
        for (const photoName of photosList) {
            photosToAdd.push(path.join(tripPhotosDir, photoName))
        }
        if (!(photosToAdd.includes(humanPhotoDir))) {
            photosToAdd.push(humanPhotoDir)
        }
        //photosToAdd.push(getHumanPhotoDir(trip.humanId))
        let tripTitle = trip.tripName
        let currentDatetime = trip.dateStart
        let endDate = trip.dateStop
        while (createDateId(currentDatetime) != createDateId(addDays(endDate, 1))) {
            console.log(createDateId(currentDatetime))
            let dateId = createDateId(currentDatetime)
            if (!(returnedDict[dateId])) {
                console.log({"interactionClass": "trip", "title": tripTitle, "photos": photosToAdd, "titlesDict": {[currentDatetime.toISOString()]: tripTitle}})
                returnedDict[dateId] = {"interactionClass": "trip", "title": tripTitle, "photos": photosToAdd, "titlesDict": {[currentDatetime.toISOString()]: tripTitle}}
            }
            else {
                returnedDict[dateId]["interactionClass"] += "_trip"
                for (let photoDir of photosToAdd) {
                    if (!(returnedDict[dateId]["photos"].includes(photoDir))) {
                        returnedDict[dateId]["photos"].push(photoDir)
                    }
                }
                returnedDict[dateId]["titlesDict"][currentDatetime.toISOString()] = tripTitle
            }
           currentDatetime = addDays(currentDatetime, 1)
        }
    }



    for (let dateIdentifier in returnedDict) {
        if (returnedDict[dateIdentifier]["interactionClass"] != "wedding") {
            if (Object.keys(returnedDict[dateIdentifier]["titlesDict"]).length == 1) {
                returnedDict[dateIdentifier]["computedTitle"] = Object.values(returnedDict[dateIdentifier]["titlesDict"])[0]
            }
            if (Object.keys(returnedDict[dateIdentifier]["titlesDict"]).length == 2) {
                let sortedKeys = Object.keys(returnedDict[dateIdentifier]["titlesDict"]).sort()
                let sortedValues = []
                for (let key of sortedKeys) {
                    sortedValues.push(returnedDict[dateIdentifier]["titlesDict"][key])
                }
                let computedTitle = `${sortedValues[0]} oraz ${sortedValues[1]}`
                returnedDict[dateIdentifier]["computedTitle"] = computedTitle
            }
            if (Object.keys(returnedDict[dateIdentifier]["titlesDict"]).length > 2) {
                let sortedKeys = Object.keys(returnedDict[dateIdentifier]["titlesDict"]).sort()
                let sortedValues = []
                for (let key of sortedKeys) {
                    sortedValues.push(returnedDict[dateIdentifier]["titlesDict"][key])
                }
                let computedTitle = ""
                for (let description of sortedValues.slice(0,-1)) {
                    computedTitle = computedTitle + `${description}, `
                }
                computedTitle = computedTitle + ` oraz ${sortedValues.at(-1)}`
                returnedDict[dateIdentifier]["computedTitle"] = computedTitle
            }
        }
        else {
            returnedDict[dateIdentifier]["computedTitle"] = returnedDict[dateIdentifier]["title"]
        }
    }
    console.log(`${returnedDict} - linia 254`)
    return returnedDict
    }
    //getCalendar(2025)