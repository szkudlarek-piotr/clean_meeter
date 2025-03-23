export default function createDateId(date) {
    const monthsDict = {0: "Styczeń", 1:"Luty", 2: "Marzec", 3: "Kwiecień", 4: "Maj", 5: "Czerwiec", 6:"Lipiec", 7: "Sierpień", 8:"Wrzesień", 9:"Październik", 10: "Listopad", 11:"Grudzień"}
    const dateObj = new Date(date)
    const dayNumber = dateObj.getDate()
    const monthName = monthsDict[dateObj.getMonth()].substring(0,3)
    const yearNumber = dateObj.getFullYear()
    const returnedString = `${dayNumber}_${monthName}_${yearNumber}`
    return returnedString
}