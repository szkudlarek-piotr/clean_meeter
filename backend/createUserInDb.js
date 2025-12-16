import dotenv from 'dotenv'
import mysql from 'mysql2'
import crypto from 'crypto'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

async function addUSer(username, email, password) {
    const salt = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64)
    //const password = "JakieśTajemniczeHasełko"
    const saltedPasswd = password + salt
    const hasehdPasswd = crypto.hash('sha256', saltedPasswd)
    try {
        const [insertReq] = await pool.query("INSERT INTO users (username, email, salt, hashedPasswd) VALUES (?, ?, ?, ?)", [username, email, salt, hasehdPasswd])
        return insertReq
    } catch (error) {
        return error
    }

}

