async function addHuman() {
    const addedHumanName = document.getElementById("addedHumanNameInput").value
    const addedHumanSurname = document.getElementById("addedHumanSurnameInput").value
    const city = document.getElementById("cityInput").value
    const photoLink = document.getElementById("photoInput").value
    const reqParams = {
        clique_name: addedCliqueName,
        clique_photo_link: addedCliquePhotoLink
    }
    const queryString = new URLSearchParams(reqParams).toString()
    if (addedCliqueName.length > 2 && addedCliquePhotoLink.includes("https://")) {
        const cliqueAddReq = await fetch(`http://localhost:3000/add-clique?${queryString}`, {method: "POST"})
        const responseJson = await cliqueAddReq.json()
        console.log(responseJson)
    }
    else {
        alert("Podane przez Ciebie dane zostały uznane za niewystarczające!")
    }
}