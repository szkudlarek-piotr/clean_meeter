async function getSuggestedCliques() {
    removeCliquessSuggestions()
    const deliveredSubstring = document.getElementById("cliqueInput").value
    let cliquesSuggestions = document.getElementById("cliquesSuggestionsInAddHuman")
    if (deliveredSubstring.length > 1) {
        const cliqueGetReq = await fetch(`http://localhost:3000/get-cliques-from-subs?cliqueInput=${deliveredSubstring}`)
        let suggestedCliquesJson = await cliqueGetReq.json()
        for (let clique of suggestedCliquesJson) {
            let createdCliqueDiv = document.createElement("div")
            createdCliqueDiv.setAttribute("class", "cliqueSuggestion")
            createdCliqueDiv.setAttribute("onclick", `setCliqueInputValue("${clique.id}", "${clique.name}")`)
            cliquesSuggestions.appendChild(createdCliqueDiv)

            let nameOfCliqueDiv = document.createElement("div")
            nameOfCliqueDiv.setAttribute("class", "nameOfClique")
            nameOfCliqueDiv.innerText = clique.name
            createdCliqueDiv.appendChild(nameOfCliqueDiv)

            let cliquePhotoElement = document.createElement("div")
            cliquePhotoElement.setAttribute("class", "photoOfClique")
            cliquePhotoElement.innerHTML = `<img src=${clique.photoDir} />`
            createdCliqueDiv.appendChild(cliquePhotoElement)
        }
    }
}