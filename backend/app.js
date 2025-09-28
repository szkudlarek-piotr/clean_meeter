import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import getFinalHumans from './getFinalHumans.js'
import addClique from './addClique.js'
import addHuman from './addHuman.js'
import addQuote from './addQuoteBackend.js'
import addVisitGuest from './addVisitGuest.js'
import getHumanFromSubstring from './getHumanFromNameSubstring.js'
import getHumanFromSubstringSorted from './getHumanFromSubstringSorted.js'
import getCliquesFromSubstring from './getCliquesFromSubstring.js'
import getCliquesWithHumans from './getCLiquesWithHumans.js'
import addVisit from './addVisitBackend.js'
import addMeeting from './addMeetingBackend.js'
import addCalendarEvent from './addEvent.js'
import addMettingHuman from './addMeetingHuman.js'
import addWedding from './addWedding.js'
import getCalendar from './getCalendar.js'
import getPlaceBySubstring from './getPlaceBySubstring.js'
import getHumanNameFromId from './getHumanNameFromId.js'
import getSuggestedEventPhotos from './getSuggestedEventPhotos.js'
import getBasicInfoForModal from './getBasicInfoForHumanModal.js'
import getOftenSeenWith from './getOftenSeenWith.js'
import getHumanQuotes from './getHumanQuotes.js'
import getHumanVisits from './getHumanVisits.js'
import getHumanMeetings from './getHumanMeetings.js'
import getHumanEvents from './getHumanEvents.js'
import getRelatiogramData from './getRelatiogramData.js'
import addEventCompanion from './addEventCompanion.js'
import getBasicDayInfo from './getBasicDayInfo.js'
import getPlacesData from './getPlacesData.js'
import getVisitedPlaces from './getVisitedPlaces.js'
import addPlace from './addPlace.js'
import getSuggestedPlaceCategories from './getPLaceCategories.js'
import getQuoteForGuessingWithExcludedQuoteIds from './getQuoteForGuessingWithExcludedIds.js'
import getQuoteAuthorData from './getQuoteAuthorData.js'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err,req,res,next) => {
    console.error(err.stack)
    res.status(500).send('something broke')
})

app.get('/get-humans', async (req, res) => {
    const sendedArray = await getFinalHumans()
    res.send(sendedArray)
})

app.get('/get-human-name-from-id', async(req,res) => {
    const humanId = req.query.id
    try {
        const nameAndPhoto = await getHumanNameFromId(humanId)
        res.send(nameAndPhoto)
    }
    catch (error) {
        res.send(error)
    }

})

app.get('/get-cliques-from-subs', async(req, res) => {
    try {
        const deliveredSubstring = req.query.cliqueInput
        const returnedArray = await getCliquesFromSubstring(deliveredSubstring)
        res.send(returnedArray)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/get-all-cliques', async(req,res) => {
    const cliquesData = await getCliquesWithHumans()
    res.send(cliquesData)
})

app.get('/suggested-event-photos', async(req, res)=>{
    const deliveredString = req.query.inputString
    const returnedArr = await getSuggestedEventPhotos(deliveredString)
    res.send(returnedArr)
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

app.get('/get-sorted-humans-from-substring', async(req, res) => {
    try {
        const deliveredString = req.query.queryString
        const mode = req.query.mode
        const sortedHumans = await getHumanFromSubstringSorted(deliveredString, mode)
        res.send(sortedHumans)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/basic-info-for-human-modal', async(req, res) => {
    try {
        const humanId = req.query.humanId
        const requestResult = await getBasicInfoForModal(humanId)
        res.send(requestResult)
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
})

app.get('/get-often-seen-with', async(req, res) => {
    const humanId = req.query.humanId
    const returnedList = await getOftenSeenWith(humanId)
    res.send(returnedList)
})

app.get('/get-human-quotes', async(req, res) => {
    try {
        const humanId = req.query.humanId
        const humanQuotesList = await getHumanQuotes(humanId)
        res.send(humanQuotesList)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/get-human-meetings', async(req, res) => {
    try {
        const humanId = req.query.humanId
        const humanMeetingsList = await getHumanMeetings(humanId)
        res.send(humanMeetingsList)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/get-human-visits', async(req, res) => {
    try {
        const humanId = req.query.humanId
        const humanVisitsData = await getHumanVisits(humanId)
        res.send(humanVisitsData)
    }
    catch (error) {
        res.send(humanVisitsData)
    }
})

app.get('/get-human-events', async(req, res) => {
    try {
        const humanId = req.query.humanId
        const humanEventsData = await getHumanEvents(humanId)
        res.send(humanEventsData)
    }
    catch (error) {
        res.send(error)
    } 
})

app.get('/relatiogram', async(req, res) => {
    try {
        const humanId = req.query.humanId
        const dataToSend = await getRelatiogramData(humanId)
        res.send(dataToSend)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/basic-day-info', async(req, res) => {
    const dateString = req.query.dateString
    const queryResult = await getBasicDayInfo(dateString)
    res.send(queryResult)
})

app.get('/places-data', async(req, res) => {
    try {
        const humanId = req.query.humanId
        const placesData = await getPlacesData(humanId)
        res.send(placesData)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/get-visited-places', async(req, res) => {
    try {
        const visitedPlacesData = await getVisitedPlaces()
        res.send(visitedPlacesData)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/get-place-categories', async(req, res) => {
    try {
        const inputString = req.query.placeCategory
        const placesCategories = await getSuggestedPlaceCategories(inputString)
        res.send(placesCategories)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/get-place-by-substring', async(req, res) => {
    try {
        const inputString = req.query.placeName
        const places = await getPlaceBySubstring(inputString)
        res.send(places)
    }
    catch (error) {
        res.send(error)
    }
})

app.get('/single-quote-exclude-ids', async(req, res) => {
    const excludedQuotesString = req.query.excludedIds
    const quoteToGuess = await getQuoteForGuessingWithExcludedQuoteIds(excludedQuotesString)
    res.send(quoteToGuess)
})

app.get('/check-quote-author-data', async(req, res) => {
    const quoteId = req.query.quoteId
    try {
        const quoteAuthorData = await getQuoteAuthorData(quoteId)
        console.log(quoteAuthorData)
        res.send(quoteAuthorData)
    }
    catch (error) {
        console.log(error)
        res.send(error)
    }
})

app.post('/add-event-human', async(req, res) => {
    try {
        const eventId = req.body.eventId
        const humansList = req.body.humansList
        const addingData = await addEventCompanion(eventId, humansList)
        res.send(addingData)
    }
    catch (error) {
        res.send(error)
    }
})

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
    const meetingPlaceId = req.query.meetingPlaceId
    try {
        const meetingAddReq = await addMeeting(date, place, shortDesc, longDesc, meetingPlaceId)
        res.send(meetingAddReq) 
    }
    catch (error) {
        res.send(error)
    }
})

app.post('/add-event', async(req, res) => {
    const { eventName, dateStart, dateStop, comingDate, leavingDate, placeName, longDesc, photoAddingInfo } = req.body
    const stringifiedJson = JSON.stringify(req.body)
    const eventAddingResult = await addCalendarEvent(eventName, dateStart, dateStop, comingDate, leavingDate, placeName, longDesc, photoAddingInfo)
    res.send(eventAddingResult)

})

app.get('/get-calendar', async(req, res) => {
    const yearNumber = req.query.year
    const calendar = await getCalendar(yearNumber)
    res.send(calendar)
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

app.post('/add-place', async(req, res) => {
    try {
        const name = req.query.name
        const category = req.query.category
        const lat = req.query.lat
        const lon = req.query.lon
        const wasThere = req.query.wasThere
        const addPlaceReq = await addPlace(name, category, lat, lon, wasThere)
        res.send(addPlaceReq)
    }
    catch (error) {
        res.send(error)
    }
})

app.post('/add-wedding', async(req, res) => {
    const date = req.query.date
    const groomId = req.query.groomId
    const brideId = req.query.brideId
    const title = req.query.title
    const partnerId = req.query.partnerId
    const weddingPlace = req.query.weddingPlace
    const partyPlace = req.query.partyPlace
    const hotelName = req.query.hotelName
    const weddingDescription = req.query.weddingDescription
    const wasIInvited = req.query.wasIInvited
    try {
        if (partnerId == "") {
            const postWeddingReq = await addWedding(date,groomId, brideId, title, "NULL", weddingPlace, partyPlace, hotelName, weddingDescription, wasIInvited)
        }
        else {
            const postWeddingReq = await addWedding(date,groomId, brideId, title, partnerId, weddingPlace, partyPlace, hotelName, weddingDescription, wasIInvited)
        }
        res.status(200).send(postWeddingReq)
    }
    catch (error) {
        res.send(error)
    }
})

app.listen(3000, () => {
    console.log('server is running on port 3000')
})