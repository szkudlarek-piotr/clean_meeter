import dotenv from 'dotenv'
import mysql from 'mysql2'
import crypto from 'crypto'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

async function checkLoginData(username, passwd) {
    const [loginReq] = await pool.query("SELECT username, salt, hashedPasswd FROM users WHERE username = ?", [username])
    if (loginReq.length == 1) {
        const saltInDb = loginReq[0]["salt"]
        const hashedPasswd = loginReq[0]["hashedPasswd"]
        const saltedDeliveredPassowrd = passwd + saltInDb
        console.log(saltedDeliveredPassowrd)
        console.log(hashedPasswd)
        const testedHash = crypto.hash('sha256', saltedDeliveredPassowrd)
        if (testedHash === hashedPasswd) {
            console.log(`Pomyślnie zalogowano jako ${username}.`)
        }
        else {
            console.log("Podałeś złe hasło lub zły login.")
        }

    }
    else {
        console.log("Taki użytkownik nie istnieje.")
        return "Użytkownik o podanym username nie istnieje!"
    }
}