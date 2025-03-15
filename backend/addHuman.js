import dotenv from 'dotenv'
import mysql from 'mysql2'
import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

////muszę dodać obsługę sytuacji, gdzie dodam osobę do bazy, ale zdjęcie się nie pobierze

export default async function addHuman(name, surname, gender, city, cliqueId, photoLink) {
    console.log("wchodzę do funckji")
    console.log(photoLink)
    const reqText = "INSERT INTO `party_people` (`ID`, `name`, `surname`, `lives_where`, `gender`, `klika_id`) VALUES (NULL, ?, ?, ?, ?, ?);"
    const [postRequest] = await pool.query(reqText, [name, surname, city, gender, cliqueId])
    const addedHumanID = postRequest.insertId
    const photoExtension = photoLink.split(".").pop()
    let addedPhotoName
    if (photoExtension == "jpg") {
            addedPhotoName = `${addedHumanID.toString()}.jpg`
    }
    else if (photoExtension == "png") {
        addedPhotoName = `${addedHumanID.toString()}.png`
    }
    else {
        addedPhotoName = `${addedHumanID.toString()}.jpg`
    }
    const downloadPhotoDir = path.join(__dirname, "photos", addedPhotoName)
    const response = await fetch(photoLink)
    if (!response.ok) throw new Error(`Błąd pobierania obrazu: ${response.statusText}`)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(downloadPhotoDir, Buffer.from(buffer))
    return postRequest
}