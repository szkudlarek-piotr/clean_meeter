import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getHumanFromSubstring(deliveredSubstring){
    let returnedArr = []
    const [possiblePeopleArr] = await pool.query("SELECT id, CONCAT(name, ' ', surname) as full_name FROM party_people WHERE CONCAT(name, ' ', surname) LIKE ?", [`%${deliveredSubstring}%`])
    for (let human of possiblePeopleArr) {
        let newHumanToAdd = {"id": human.id, "name": human.full_name, "photoDir": getHumanPhotoDir(human.id)}
        returnedArr.push(newHumanToAdd)
    }
    return returnedArr
}
