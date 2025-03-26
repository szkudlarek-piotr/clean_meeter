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
                console.log("Pomyśłnie pobrano zdjęcie!")
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
downloadPhotoFromLink("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Focdn.eu%2Fpulscms-transforms%2F1%2F5pZktkpTURBXy9mNWEwMzc0MTdiODc2ZjFmMTFmNDc0ZDdhNDNlZmQwMS5qcGeSlQMAI80D6M0CMpMFzQSwzQJ2&f=1&nofb=1&ipt=c6041f3e47d39e2c6c0f9b943bcdfdae4bc69f9b2c30e304821fbb435c9b616f&ipo=images", "C:\\Users\\piotr\\OneDrive\\Pulpit\\projekty\\clean_meeter\\backend\\events", "wybory")