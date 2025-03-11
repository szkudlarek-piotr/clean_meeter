import dotenv from 'dotenv'
import mysql from 'mysql2'
import getCliquePhoto from './getPhotoFromCliqueName.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getCliquesFromSubstring(deliveredSubstring){
    let returnedArr = []
    const [possiblePeopleArr] = await pool.query("SELECT * FROM cliques_names WHERE clique_name LIKE ?", [`%${deliveredSubstring}%`])
    for (let clique of possiblePeopleArr) {
        let newCliqueToAdd = {"id": clique.id, "name": clique.clique_name, "photoDir": getCliquePhoto(clique.id)}
        returnedArr.push(newCliqueToAdd)
    }
    return returnedArr
}