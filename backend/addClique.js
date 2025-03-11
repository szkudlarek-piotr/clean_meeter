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

export default async function addClique(name, link) {
    try {
        const [cliqueExistsCheck] = await pool.query("SELECT * FROM cliques_names WHERE clique_name LIKE ?", [name])
        if (cliqueExistsCheck.length > 0) {
            console.log("Taka klika już istnieje!")
            return "Taka klika już istnieje!"
        }
        else {
            const requestTemplate = "INSERT INTO `cliques_names` (`id`, `clique_name`) VALUES (NULL, ?)"
            const [postQuoteRequest] = await pool.query(requestTemplate, [name])
            const addedPhotoId = postQuoteRequest.insertId
            let downloadedPhotoName = addedPhotoId
            if (link.includes(".png")) {
                downloadedPhotoName += ".png"
            }
            else if (link.includes(".jpg")) {
                downloadedPhotoName += ".jpg"
            }
            else {
                downloadedPhotoName += ".jpeg"
            }
            const downloadPhotoDir = path.join(__dirname, "cliques_photos", downloadedPhotoName)
            const response = await fetch(link)
            if (!response.ok) throw new Error(`Błąd pobierania obrazu: ${response.statusText}`)
            const buffer = await response.arrayBuffer()
            fs.writeFileSync(downloadPhotoDir, Buffer.from(buffer))
            return "Dodano!"
        }
    }
    catch (error) {
        console.error("Błąd w addClique:", error);
        return "Wystąpił błąd!";
    }


}