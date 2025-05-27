import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getHumanVisits(humanId) {
    const visitsReqText = `
    SELECT visit_date as date, visit_duration as duration, short_description AS title, description AS long_description
    FROM visits
    WHERE visit_id IN (
        SELECT visit_id
        FROM visit_guest
        WHERE guest_id = ?
    )
    `
    const monthsDict = {0: "stycznia", 1: "lutego", 2: "marca", 3: "kwietnia", 4: "maja", 5: "czerwca", 6: "lipca", 7: "sierpnia", 8: "września", 9: "października", 10: "listopada", 11: "grudnia"}
    const [visitsData] = await pool.query(visitsReqText, [humanId])
    for (let visit of visitsData) {
        let dateObj = new Date(visit["date"])
        console.log(dateObj.getMonth())
        let monthAsString = monthsDict[dateObj.getMonth()]
        if (visit["duration"] == 1) {
                const dateString = `${dateObj.getDate()} ${monthAsString} ${dateObj.getFullYear()}`
                console.log(dateString)
        }
        else {
            const numberOfDaysToAdd = visit["duration"] - 1
            
        }

    }
}
getHumanVisits(7)