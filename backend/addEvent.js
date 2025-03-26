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
    const eventPhotosDir = path.join(__dirname, "events")
    const addEventText = "INSERT INTO `events` (`id`, `nameOfEvent`, `dateStart`, `dateStop`, `meComingDate`, `meLeavingDate`, `place`, `Generic_photo`, `description`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);"
    if (photoAddingInfo.mode == "link") {
        try {
            const addedPhotoName = await downloadPhotoFromLink(photoAddingInfo.link, eventPhotosDir, photoAddingInfo.name)
            const [addEventReq] = await pool.query(addEventText, [eventName, dateStart, dateStop, comingDate, leavingDate, placeName, addedPhotoName, longDesc])
            console.log(addEventReq)
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
addEvent('Odwiedziny Sambora i Michaliny', '2025-04-05 15:30:00', '2025-04-06 18:40:00', '2025-04-05 15:30:00', '2025-04-06 18:40:00', 'Abra Studio', 'Sambor z Michaliną odwiedzają Warszawę, aby zarobić piniąc.', {"mode": "link", "name": "sambor_michalina", "link": "https://www.abra-studio.pl/files/workshop/workshop970.png"})