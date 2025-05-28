import dotenv from 'dotenv'
import mysql from 'mysql2'
import createDateString from './multiuseFunctions/dateToString.js'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()


function addDays(date, numberOfDays) {
    var result = new Date(date);
    result.setDate(result.getDate() + numberOfDays);
    return result;
  }

export default async function getHumanVisits(humanId) {
    const visitsReqText = `
    SELECT visit_id, visit_date as date, visit_duration as duration, short_description AS title, description AS long_description
    FROM visits
    WHERE visit_id IN (
        SELECT visit_id
        FROM visit_guest
        WHERE guest_id = ?
    )
    ORDER BY visits.visit_date ASC
    `
    const monthsDict = {0: "stycznia", 1: "lutego", 2: "marca", 3: "kwietnia", 4: "maja", 5: "czerwca", 6: "lipca", 7: "sierpnia", 8: "września", 9: "października", 10: "listopada", 11: "grudnia"}
    const [visitsData] = await pool.query(visitsReqText, [humanId])
    let visitsList = []
    for (let visit of visitsData) {
        let newVisit = {}
        let visitId = visit["visit_id"]
        let dateObj = new Date(visit["date"])
        if (visit["duration"] == 1) {
            newVisit["date"] = createDateString(visit["date"])
        }
        else {
            const numberOfDaysToAdd = visit["duration"] - 1
            let lastVisitDay = addDays(dateObj, numberOfDaysToAdd)
            newVisit["date"] = `${createDateString(visit["date"])} - ${createDateString(lastVisitDay)}`
        }
        newVisit["shortDesc"] = visit["title"]
        if (visit["long_description"].length > 3) {
            newVisit["longDesc"] = visit["long_description"]
        }
        visitsList.push(newVisit)
    }

    return visitsList
}