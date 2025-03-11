function dateToText(dateToChange) {
    const monthsJson = {0: "stycznia", 1:"lutego", 2: "marca", 3: "kwietnia", 4: "maja", 5: "czerwca", 6:"lipca", 7: "sierpnia", 8:"września", 9:"października", 10: "listopada", 11:"grudnia"}
    const dateObject = new Date(dateToChange)
    const dayOfMonth = dateObject.getDate()
    const monthInWords = monthsJson[dateObject.getMonth()]
    const yearNumber = dateObject.getFullYear()
    const dateInWords = `${dayOfMonth} ${monthInWords} ${yearNumber}`
    return dateInWords
}