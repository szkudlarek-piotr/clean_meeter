function setInteractionPlace(placeName, placeId) {
    clearPlaceSuggestions()
    let hiddenPlaceIdInput = document.getElementById("hiddenPlaceIdInput")
    let placeNameInput = document.getElementById("placeWithDropdownInput")
    hiddenPlaceIdInput.setAttribute("value", placeId)
    placeNameInput.value = ""
    placeNameInput.setAttribute("placeholder", placeName)
}