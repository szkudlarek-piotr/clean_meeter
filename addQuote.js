async function addQuote() {
    let quoteAuthorInputElement = document.getElementById("quoteAuthorInput")
    let idOfAuthor = ""
    let checkedPublicRadio = document.querySelector('input[name="isPublic"]:checked')
    if (quoteAuthorInputElement.hasAttribute("chsoenAuthor") && checkedPublicRadio != null) {
        idOfAuthor = quoteAuthorInputElement.getAttribute("chsoenAuthor").toString()
        const quoteToSave = encodeURI(document.getElementById("quoteTextarea").value)
        const isPublic = document.querySelector('input[name="isPublic"]:checked').value
        const postRequest = await fetch(`http://localhost:3000/add-quote?author=${idOfAuthor}&quote=${quoteToSave}&ispublic=${isPublic}`, {method: "POST"})
        document.getElementById("quoteAuthorInput").removeAttribute("chsoenAuthor")
        document.getElementById("quoteAuthorInput").setAttribute("placeholder", "")
        document.getElementById("quoteTextarea").value = ""
    }
    else {
        alert("Dostarczone prez Ciebie dane zostały uznane za niepełne.")
    }
}