import fs from 'fs'
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function getHumanPhotoDir(humanId) {
    let defaultPhotoDir = path.join(__dirname, "photos", `${humanId.toString()}.jpg`)
    if (fs.existsSync(defaultPhotoDir)) {
        return defaultPhotoDir
    }
    else {
        return path.join(__dirname, "photos", "anonymous.jpg")
    }
}
