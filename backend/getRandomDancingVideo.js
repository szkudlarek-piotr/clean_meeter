import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()

const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getRandomDancingVideo() {
    const queryText = `
    SELECT id, title, link 
    FROM videos 
    WHERE is_dancing_lesson_video = 1
    ORDER BY RAND() 
    LIMIT 1`
    const [query] = await pool.query(queryText)
    return query[0]
}
