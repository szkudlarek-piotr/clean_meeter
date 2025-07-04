async function addHuman(event) {
    const addedHumanName = document.getElementById("addedHumanNameInput").value
    const addedHumanSurname = document.getElementById("addedHumanSurnameInput").value
    const addedHumanGender = document.querySelector('input[name="sex"]:checked')?.value
    const city = document.getElementById("cityInput").value
    const photoLink = document.getElementById("photoInput").value
    const cliqueId = document.getElementById("cliqueIdInput").value
    const reqParams = {
        name: addedHumanName,
        surname: addedHumanSurname,
        city: city,
        photoLink: photoLink,
        gender: addedHumanGender,
        cliqueId: cliqueId
    }
    const queryString = new URLSearchParams(reqParams).toString()
    if ( cliqueId && addedHumanGender) {
        try {
            const cliqueAddReq = await fetch(`http://localhost:3000/add-human?${queryString}`, {method: "POST"})
            const responseJson = await cliqueAddReq.json()
            alert("Udało się dodać osobę!")
        }
        catch (error) {
            console.log(error)
        }
        
    }
    else {
        alert("Podane przez Ciebie dane zostały uznane za niewystarczające!")
    }
    debugger
}