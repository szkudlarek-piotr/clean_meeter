//So far I am only doing the easy things - adding from link of from database.
import dotenv from 'dotenv'
import mysql from 'mysql2'
import downloadPhotoFromLink from './downloadPhotoFromLink.js'
import { fileURLToPath } from "url";
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addCalendarEvent(eventName, dateStart, dateStop, comingDate, leavingDate, placeName, longDesc, photoAddingInfo, placeId) {
    const eventPhotosDir = path.join(__dirname, "events")

    if (photoAddingInfo.mode == "link") {
        if (photoAddingInfo.name.length > 1) {
            const addedPhotoName = await downloadPhotoFromLink(photoAddingInfo.link, eventPhotosDir, photoAddingInfo.name)
            if (placeId.length == 0) {
                let addEventText = "INSERT INTO `events` (`id`, `nameOfEvent`, `dateStart`, `dateStop`, `meComingDate`, `meLeavingDate`, `place`, `Generic_photo`, `description`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);"
                const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, addedPhotoName, longDesc])
                console.log(addEventReq)   
            }
            else {
                let addEventText = "INSERT INTO `events` (`id`, `nameOfEvent`, `dateStart`, `dateStop`, `meComingDate`, `meLeavingDate`, `place`, `Generic_photo`, `description`, `place_id`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                try {
                    const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, addedPhotoName, longDesc, placeId])
                    console.log(addEventReq)      
                }
                catch (error) {
                    console.log(error)
                    addEventText = "INSERT INTO `events` (`id`, `nameOfEvent`, `dateStart`, `dateStop`, `meComingDate`, `meLeavingDate`, `place`, `Generic_photo`, `description`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);"
                    const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, addedPhotoName, longDesc])
                    console.log(addEventReq)   
                }
          
            }

            return addEventReq
        }
        else {
            console.log("Będę dodawał z linka bez nazwy zdjęcia!")
            const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, "", longDesc])
            console.log(addEventReq)   
            const addedEventId = addEventReq.insertId
            const addedPhotoName = await downloadPhotoFromLink(photoAddingInfo.link, eventPhotosDir, addedEventId)
        }
        return addEventReq
    }
    if (photoAddingInfo.mode == "database") {
        try {
            if (placeId.length == 0) {
                let addEventText = "INSERT INTO `events` (`nameOfEvent`, `dateStart`, `dateStop`, `meComingDate`, `meLeavingDate`, `place`, `Generic_photo`, `description`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);"
                const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, photoAddingInfo.name, longDesc])
                console.log(addEventReq)   
                return addEventReq
            }
            else {
                let addEventText = "INSERT INTO `events` (`nameOfEvent`, `dateStart`, `dateStop`, `meComingDate`, `meLeavingDate`, `place`, `Generic_photo`, `description`, `place_id`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, photoAddingInfo.name, longDesc, placeId])
                console.log(addEventReq)   
                return addEventReq
            }
        }
        catch (error) {
            return error
        }
    }
}
