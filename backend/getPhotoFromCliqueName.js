import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliquesPhotoFolder = path.join(__dirname, "cliques_photos")
export default function getCliquePhoto(cliqueId) {
    const possiblePngDir = path.join(cliquesPhotoFolder, `${cliqueId}.png`)
    const possibleJpgDir = path.join(cliquesPhotoFolder, `${cliqueId}.jpg`)
    if (fs.existsSync(possibleJpgDir)) {
        return possibleJpgDir
    } 
    if (fs.existsSync(possiblePngDir)) {
        return possiblePngDir
    }
}