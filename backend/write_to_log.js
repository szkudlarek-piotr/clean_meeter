import fs from 'fs'

export default function writeToLogFile(functionName, messageToWrite, filePath) {
    const now = new Date()
    const formattedDate = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');

    const writtenString = `${formattedDate} - function ${functionName} - ${messageToWrite} \n`

    try {
        fs.appendFileSync(filePath, writtenString)
    }
    catch (error) {
        console.log(error)
    }
}