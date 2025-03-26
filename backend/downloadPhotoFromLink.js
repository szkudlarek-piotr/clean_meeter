import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs'

export default async function downloadPhotoFromLink(photoLink, folderDirectory, photoName) {
    try {
        const response = await fetch(photoLink, {method: "HEAD"})
        const fileType= response.headers.get("Content-Type").split("/")[0]
        const fileExtension = response.headers.get("Content-Type").split("/")[1]
        if (fileType == "image") {
            const fileName = `${photoName}.${fileExtension}`
            const writingDir = path.join(folderDirectory, fileName)
            const imageResponse = await fetch(photoLink)
            if (imageResponse.ok) {
                const arrayBuffer = await imageResponse.arrayBuffer()
                //This way, you can accidentaly replace an old image on the disk.
                fs.writeFileSync(writingDir, Buffer.from(arrayBuffer))
                return fileName
            }
            else {
                console.log(imageResponse.status)
            }
        }
        else {
            console.log("This link does not point to an image.")
        }
    }
    catch (error) {
        console.log(error)
        return null
    }
}
