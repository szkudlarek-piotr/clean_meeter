import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import getFinalHumans from './getFinalHumans.js'
import addClique from './addClique.js'
import addHuman from './addHuman.js'
import addQuote from './addQuoteBackend.js'
import addVisitGuest from './addVisitGuest.js'
import getHumanFromSubstring from './getHumanFromNameSubstring.js'
import getCliquesFromSubstring from './getCliquesFromSubstring.js'
import getCliquesWithHumans from './getCLiquesWithHumans.js'
import addVisit from './addVisitBackend.js'
import addMeeting from './addMeetingBackend.js'
import addMettingHuman from './addMeetingHuman.js'
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err,req,res,next) => {
    console.error(err.stack)
    res.status(500).send('something broke')
})

app.get('/get-humans', async (req, res) => {
    const sendedArray = await getFinalHumans()
    res.send(sendedArray)
})

app.get('/get-cliques-from-subs', async(req, res) => {
    const deliveredSubstring = req.query.cliqueInput
    const returnedArray = await getCliquesFromSubstring(deliveredSubstring)
    res.send(returnedArray)
})

app.get('/get-all-cliques', async(req,res) => {
    const cliquesData = await getCliquesWithHumans()
    res.send(cliquesData)
})


app.get('/get-human-from-substring', async (req, res) => {
    try {
        const deliveredString = req.query.name_fragment;
        if (!deliveredString) {
            return res.status(400).send({ error: "name_fragment is required" });
        }
        const arrayOfPeople = await getHumanFromSubstring(deliveredString);
        res.send(arrayOfPeople);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

app.post('/add-human', async(req, res) => {
    const name = req.query.name
    const surname = req.query.surname
    const city = req.query.city
    const photoLink = req.query.photoLink
    const cliqueId = req.query.cliqueId
    const gender = req.query.gender
    try {
        const addStatus = await addHuman(name, surname, gender, city, cliqueId, photoLink)
        res.send(addStatus)
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
})

app.post('/add-visit', async(req, res) => {
    const date = req.query.date
    const duration = req.query.duration
    const shortDesc = req.query.shortDesc
    const longDesc = req.query.longDesc
    try {
        const visitAddReq = await addVisit(date, duration, shortDesc, longDesc)
        res.send(visitAddReq) 
    }
    catch (error) {
        res.send(error)
    }
})

app.post('/add-visit-guest', async(req, res) => {
    const visitId = req.query.visitId
    const guestId = req.query.guestId
    try {
        const visitGuestReq = await addVisitGuest(visitId, guestId)
        res.send(visitGuestReq)
    }
    catch (error) {
        res.send(error)
    }
})

app.post('/add-meeting', async(req, res) => {
    const date = req.query.date
    const place = req.query.place
    const shortDesc = req.query.shortDesc
    const longDesc = req.query.longDesc
    try {
        const meetingAddReq = await addMeeting(date, place, shortDesc, longDesc)
        console.log(meetingAddReq)
        res.send(meetingAddReq) 
    }
    catch (error) {
        res.send(error)
    }
})

app.post('/add-meeting-human', async(req, res) => {
    const meetingId = req.query.meetingId
    const humanId = req.query.humanId
    try {
        const insertQuery = await addMettingHuman(meetingId, humanId)
        res.send(insertQuery)
    }
    catch(error) {
        res.send(error)
    }
})

app.post('/add-clique', async(req, res) => {
    const cliqueName = req.query.clique_name
    const cliquePhotoLink = req.query.clique_photo_link
    let returnedMessage
    try {
        await addClique(cliqueName, cliquePhotoLink)
        returnedMessage= "Pomyślnie dodano klikę!"
    }
    catch (error) {
        returnedMessage = error
    }
    res.send(returnedMessage)
})

app.post('/save-quote', async(req, res) => {
    const authorId = req.query.authorId
    const quote = req.query.quote
    const isPublic = req.query.ispublic
    try {
        const postQuoteReq = await addQuote(authorId, quote, isPublic)
        res.status(200).send(postQuoteReq)
    }
    catch (error) {
        res.send(error)
    }
})

app.listen(3000, () => {
    console.log('server is running on port 3000')
})