async function createLeftMenu() {
    let leftMenu = document.getElementsByClassName("left-menu")[0]
    const menuButtonsArray = [{"id":"mainPage","text": "Strona główna", "href": "index.html"}, {"id":"addNewHuman","href": "add_human.html", "text": "Dodaj nowego człowieka"},
        {"id": "calendar","href": "new_calendar.html", "text": "Zobacz kalendarz"},
         {"id": "showAllCliques","href": "all_cliques.html", "text": "Pokaż wszystkie kliki"},
          {"id": "showAllPeople","href": "final-humans.html", "text": "Zobacz wszystkich ludzi"}, 
          {"id": "addNewMeeting", "href": "add_meeting.html", "text": "Dodaj nowe spotanie"}, 
          {"id": "addNewClique", "href": "add-clique.html", "text": "Dodaj nową klikę"}, 
          {"id": "addHumansToMeeting", "text": "Dodaj ludzi do spotkania", "href": "add_humans_to_meeting.html"},
           {"id": "addVisit", "href": "add-visit.html", "text": "Dodaj wizytę!"}, 
           {"id": "addQuote", "href": "add-golden-quote.html", "text": "Dodaj Złoty Cytat"}, 
           {"id": "addEvent", "href": "add-event.html", "text": "Dodaj wydarzenie"}, {"id": "guessQuotes", "href": "guess-quotes.html", "text": "Odgadnij autora cytatu!"}]
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