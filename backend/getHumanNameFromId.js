import mysql from 'mysql2'
import dotenv from 'dotenv'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getHumanNameFromId(id) {
    const humanReqText = `SELECT CONCAT(name, ' ', surname) as name FROM party_people WHERE id = ?`
    const [humanReq] = await pool.query(humanReqText, [id])
    const returnedArray = [{"name": humanReq[0].name, "photoDir": getHumanPhotoDir(id)}]
    return returnedArray
}