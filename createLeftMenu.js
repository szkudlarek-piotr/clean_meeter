async function createLeftMenu() {
    let leftMenu = document.getElementsByClassName("left-menu")[0]
    const menuButtonsArray = [{"id":"addNewHuman","href": "add-human.html", "text": "Dodaj nowego człowieka"},
        {"id": "calendar","href": "calendar.html", "text": "Zobacz kalendarz"},
         {"id": "showAllCliques","href": "all-cliques.html", "text": "Pokaż wszystkie kliki"},
          {"id": "showAllPeople","href": "final-humans.html", "text": "Zobacz wszystkich ludzi"}, 
          {"id": "addNewMeeting", "href": "add-meeting.html", "text": "Dodaj nowe spotkanie"}, 
          {"id": "addNewClique", "href": "add-clique.html", "text": "Dodaj nową klikę"}, 
           {"id": "addVisit", "href": "add-visit.html", "text": "Dodaj wizytę!"}, 
           {"id": "addQuote", "href": "add-quote.html", "text": "Dodaj cytat"},
           {"id": "addEvent", "href": "add-event.html", "text": "Dodaj wydarzenie"},  
           {"id": "addWedding", "href": "add-wedding.html", "text": "Dodaj wesele"}, 
           {"id": "visitedPlaces", "href": "places-map.html", "text": "Odwiedzone miejsca"},
            {"id": "addPlace", "href": "add-place.html", "text": "Dodaj miejsce"}
        ]
    for (button of menuButtonsArray) {
        let newButton = document.createElement("div")
        newButton.setAttribute("class", "left_option")
        newButton.setAttribute("id", button.id)
        newButton.innerText = button.text
        if (button.hasOwnProperty("onclick")) {
            newButton.setAttribute("onclick", button.onclick)
            leftMenu.appendChild(newButton)
        }
        if (button.hasOwnProperty("href")) {
            let encapsulatingA = document.createElement("a")
            encapsulatingA.setAttribute("href", button.href)
            leftMenu.appendChild(encapsulatingA)
            encapsulatingA.appendChild(newButton)
        }
    }
}