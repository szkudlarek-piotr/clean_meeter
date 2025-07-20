import dotenv from 'dotenv'
import mysql from 'mysql2'
import fs from 'fs'
import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()

const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getHumanSuperpowers(humanId) {
    let returnedArray = []
    const superpowersIconsFolder = path.join(__dirname, "superpower_icons")
    const queryText = `
    SELECT human_superpower.superpower_id, superpowers.superpower_name
    FROM human_superpower
    JOIN superpowers ON superpowers.id = human_superpower.superpower_id
    WHERE human_superpower.human_id = ?
    `
    try {
        const [queryResult] = await pool.query(queryText, [humanId])
        for (let superpower of queryResult) {
            const potentialFileName = `${superpower.superpower_id}.png`
            const potentialFileDir = path.join(superpowersIconsFolder, potentialFileName)
            if (fs.existsSync(potentialFileDir)) {
                let objToAdd = {photo: potentialFileDir, name: superpower.superpower_name}
                returnedArray.push(objToAdd)
            }
            else {
                console.log(`I didn't find ${potentialFileDir}.`)
            }
        }
        return returnedArray
    }
    catch (error) {
        return error
    }

}