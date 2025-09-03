async function suggestPlace() {
    clearPlaceSuggestions()
    const placesInputString = document.getElementById("placeWithDropdownInput").value
    let placeWithDropdown = document.getElementById("placeWithDropdown")
    if (placesInputString.length > 1) {
        const placesReq = await fetch(`http://localhost:3000/get-place-by-substring?placeName=${placesInputString}`)
        const placesJson = await placesReq.json()
        for (let place of placesJson) {
            let placeElement = document.createElement("div")
            placeElement.setAttribute("class", "placeSuggestion")
            placeWithDropdown.appendChild(placeElement)
            let placeNameElement = document.createElement("div")
            placeNameElement.innerText = place.name
            placeNameElement.setAttribute("class", "placeName")
            placeElement.appendChild(placeNameElement)
            let placeCategoryElement = document.createElement("div")
            placeCategoryElement.innerText = place.category
            placeCategoryElement.setAttribute("class", "categoryName")
            placeElement.appendChild(placeCategoryElement)
            placeElement.setAttribute("ondblclick", `setInteractionPlace("${place.name}", "${place.id}")`)
        }
    }
}

function clearPlaceSuggestions() {
    let suggestedPlaces = document.getElementsByClassName("placeSuggestion")
    while (suggestedPlaces.length > 0) {
        suggestedPlaces[0].remove()
    }
}