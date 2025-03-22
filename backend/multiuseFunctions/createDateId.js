export default function createDateId(date) {
    console.log(date)
    const monthsDict = {0: "January", 1: "February", 2:"March", 3:"April",4:"May",5:"June",6:"July",7:"August",8:"September",9:"October",10:"November",11:"December"}
    const dateObj = new Date(date)
    const dayNumber = dateObj.getDate()
    const monthName = monthsDict[dateObj.getMonth()].substring(0,3)
    const yearNumber = dateObj.getFullYear()
    const returnedString = `${dayNumber}_${monthName}_${yearNumber}`
    return returnedString
}