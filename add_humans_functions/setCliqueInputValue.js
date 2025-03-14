function setCliqueInputValue(cliqueId, cliqueName) {
    let cliqueInputElement = document.getElementById("cliqueInput")
    let hiddenCliqueInput = document.getElementById("cliqueIdInput")

    cliqueInputElement.value = ""
    cliqueInputElement.placeholder = cliqueName
    hiddenCliqueInput.value = cliqueId

    removeCliquessSuggestions()
}