export default function createDateString(deliveredDate) {
    const monthsDict = {0: "stycznia", 1:"lutego", 2: "marca", 3: "kwietnia", 4: "maja", 5: "czerwca", 6:"lipca", 7: "sierpnia", 8:"września", 9:"października", 10: "listopada", 11:"grudnia"}
    let date = new Date(deliveredDate)
    let monthString = monthsDict[date.getMonth()]
    return `${date.getDate()} ${monthString} ${date.getFullYear()}`

}