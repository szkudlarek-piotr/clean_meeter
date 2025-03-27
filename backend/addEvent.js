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

export default async function addEvent(eventName, dateStart, dateStop, comingDate, leavingDate, placeName, longDesc, photoAddingInfo) {
    console.log("test")
    const eventPhotosDir = path.join(__dirname, "events")
    const addEventText = "INSERT INTO `events` (`id`, `nameOfEvent`, `dateStart`, `dateStop`, `meComingDate`, `meLeavingDate`, `place`, `Generic_photo`, `description`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);"
    if (photoAddingInfo.mode == "link") {
        try {
            console.log("test")

            if (photoAddingInfo.name.length > 1) {
                const addedPhotoName = await downloadPhotoFromLink(photoAddingInfo.link, eventPhotosDir, photoAddingInfo.name)
                const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, addedPhotoName, longDesc])
            }
            else {
                const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, "", longDesc])
                const addedEventId = addEventReq.insertId
                const addedPhotoName = await downloadPhotoFromLink(photoAddingInfo.link, eventPhotosDir, addedEventId)
            }
            return addEventReq
        }
        catch (error) {
            return error
        }
    }
    if (photoAddingInfo.mode == "database") {
        try {
            const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, photoAddingInfo.name, longDesc])
            return addEventReq
        }
        catch (error) {
            return error
        }
    }
}
