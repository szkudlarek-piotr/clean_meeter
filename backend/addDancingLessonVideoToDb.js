import dotenv from 'dotenv'
import mysql from 'mysql2'
import { Builder, By } from 'selenium-webdriver'

dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function addDancingLessonVideoToDb(youtubeUrl) {
    console.log(`Uruchamiam funkcję z ${youtubeUrl}.`)
    let driver = await new Builder().forBrowser('chrome').build();
    let returnedData = {}
    try {
        await driver.get(youtubeUrl);
        let videoTitle = await driver.getTitle()
        const splittedTitle = videoTitle.split("_")
        const videoTitleInDb = splittedTitle[1].trim()
        const videoDatetime = splittedTitle[0].trim()
        const videoYear = videoDatetime.substring(0, 4)
        const videoMonth = videoDatetime.substring(4, 6)
        const videoDay = videoDatetime.substring(6, 8)
        const dateToCheck = `${videoYear}-${videoMonth}-${videoDay}`
        const findEventReqText = `    
        SELECT id 
        FROM events
        WHERE DATE(dateStart) = ?
        `
        const [findEventReq] = await pool.query(findEventReqText, [dateToCheck])
        if (findEventReq.length == 1) {
            const lessonEventId = findEventReq[0]["id"]
            const addVideoReqText = "INSERT INTO `videos` (`id`, `title`, `date`, `link`, `visit_id`, `meeting_id`, `event_id`, `citybreak_id`) VALUES (NULL, ?, ?, ?, NULL, NULL, ?, NULL);"
            const [addVideoReq] = await pool.query(addVideoReqText, [videoTitleInDb, dateToCheck, youtubeUrl, lessonEventId])
            returnedData = addVideoReq

        }
        else if (findEventReq.length == 0) {
            const addVideoReqText = "INSERT INTO `videos` (`id`, `title`, `date`, `link`, `visit_id`, `meeting_id`, `event_id`, `citybreak_id`) VALUES (NULL, ?, ?, ?, NULL, NULL, NULL, NULL);"
            const [addVideoReq] = await pool.query(addVideoReqText, [videoTitleInDb, dateToCheck, youtubeUrl])
            returnedData = addVideoReq
            returnedData["info"] = "Nie znalazłem żadnej lekcji pasujacej do daty, którą odczytałem."
        }
        else {
            const addVideoReqText = "INSERT INTO `videos` (`id`, `title`, `date`, `link`, `visit_id`, `meeting_id`, `event_id`, `citybreak_id`) VALUES (NULL, ?, ?, ?, NULL, NULL, NULL, NULL);"
            const [addVideoReq] = await pool.query(addVideoReqText, [videoTitleInDb, dateToCheck, youtubeUrl])
            returnedData = addVideoReq
            returnedData["info"] = "Znalazłem więcej niż jedną lekcję pasującą do daty, którą odczytałem."
        }
        
    } finally {
        await driver.quit();
    }
    return returnedData
}