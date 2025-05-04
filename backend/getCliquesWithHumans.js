import dotenv from 'dotenv'
import mysql from 'mysql2'
import getCliquePhoto from './getPhotoFromCliqueId.js'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getCliquesWithHumans() {
    let returnedDict = {}
    const queryText = `
    SELECT party_people.ID as humanId, CONCAT(party_people.name, " ", party_people.surname) as full_name, cliques_names.id AS cliqueId, cliques_names.clique_name AS cliqueName
    FROM party_people 
    RIGHT JOIN cliques_names ON cliques_names.id = party_people.klika_id;`
    const [queryResult] = await pool.query(queryText)
    for (let record of queryResult) {
        if (!(record.humanId)) {
            returnedDict[record.cliqueId] = {"cliqueName": record.cliqueName, "cliquePhoto": getCliquePhoto(record.cliqueId), "members": []}
        }
        else {
            if (record.cliqueId in returnedDict) {
                let humanToAdd = {"humanPhotoDir": getHumanPhotoDir(record.humanId), "humanName": record.full_name}
                returnedDict[record.cliqueId]["members"].push(humanToAdd)
            }
            else {
                returnedDict[record.cliqueId] = {"cliqueName": record.cliqueName, "cliquePhoto": getCliquePhoto(record.cliqueId), "members": [{"humanPhotoDir": getHumanPhotoDir(record.humanId), "humanName": record.full_name}]}
            }
        }
    }
    return returnedDict
}