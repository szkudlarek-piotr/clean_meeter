import mysql from 'mysql2'
import dotenv from 'dotenv'
import path from 'path'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
import getCliquePhoto from './getPhotoFromCliqueName.js';
import fs from "fs"
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getFinalHumans(){ 
    let returnedArr = []
    const queryText = "SELECT * FROM final_humans"
    //I created a view in my database that has almost all info I need to create human tiles
    const [humansArr] = await pool.query(queryText)
    for (let human of humansArr) {
        const idAsString = human.id.toString()
        const humanName = human.full_name
        const humanPhotoDir = getHumanPhotoDir(idAsString)
        const cliquePhotoDir = getCliquePhoto(human.clique_name)
        const newDict = {"name": humanName, "photoDir": humanPhotoDir, "cliqueName": human.clique_name, "cliquePhoto": cliquePhotoDir, "visits": human.visit_c, "meetings": human.others_count, "quote": human.quote, "id": human.id.toString()}
        returnedArr.push(newDict)
    }
    return returnedArr
}