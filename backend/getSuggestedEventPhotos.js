import path from 'path'
import fs from 'fs'
import { fileURLToPath } from "url";

export default function getSuggestedEventPhotos(deliveredSubstring) {
    let returnedArr = []
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const eventsFolderDir = path.join(__dirname, "events")
    const photosList = fs.readdirSync(eventsFolderDir)
    for (let photoName of photosList) {
        if (photoName.includes(deliveredSubstring)) {
            let dictToAdd = {"name": photoName, "photoDir": path.join(eventsFolderDir, photoName)}
            returnedArr.push(dictToAdd)
        }
    }
    return returnedArr
}