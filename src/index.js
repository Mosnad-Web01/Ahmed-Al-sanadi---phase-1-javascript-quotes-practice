console.log("Page loaded");
document.addEventListener("DOMContentLoaded", () => {
    fetchQuotes();

    const newQuoteForm = document.querySelector("#new-quote-form");
    newQuoteForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        await addNewQuote();
    });
});

async function fetchQuotes() {
    const response = await fetch("http://localhost:3000/quotes?_embed=likes");
    const quotes = await response.json();
    
    // Sort quotes by createdAt field in descending order (latest first)
    quotes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    renderQuotes(quotes);
}

async function renderQuotes(quotes) {
    const quoteList = document.querySelector("#quote-list");
    quoteList.innerHTML = ""; // Clear existing quotes
    quotes.forEach((quote) => {
        const countLikes = quote.likes ? quote.likes.length : 0;
        const li = document.createElement("li");
        li.classList.add("quote-card");
        li.innerHTML = `
            <blockquote class="blockquote">
            <p class="mb-0">${quote.quote}</p>
            <footer class="blockquote-footer">${quote.author}</footer>
            <br>
            <button type="button" class='btn btn-success'>Likes: <span>${countLikes}</span></button>
            <button type="button" class='btn btn-danger'>Delete</button>
            </blockquote>`;
        quoteList.appendChild(li);

        // Like button event listener
        li.querySelector(".btn-success").addEventListener("click", async (e) => {
            e.preventDefault(); // Prevent default action
            console.log("Like button clicked");
            await addLike(quote, li);
        });

        // Delete button event listener
        li.querySelector(".btn-danger").addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete this quote?")) {
                await deleteQuote(quote.id, li);
            }
        });
    });
}

async function addLike(quote, listElement) {
    try {
        const response = await fetch(`http://localhost:3000/likes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quoteId: quote.id,
                createdAt: Math.floor(Date.now() / 1000),
            }),
        });

        if (!response.ok) {
            throw new Error("Something went wrong!" + response.statusText);
        } else {
            const likeButtonSpan = listElement.querySelector(".btn-success span");
            likeButtonSpan.textContent = parseInt(likeButtonSpan.textContent) + 1;
        }
    } catch (e) {
        console.log(e);
    }
}

async function addNewQuote() {
    const quoteInput = document.querySelector("#new-quote");
    const authorInput = document.querySelector("#author");

    try {
        const response = await fetch("http://localhost:3000/quotes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quote: quoteInput.value,
                author: authorInput.value,
                createdAt: Math.floor(Date.now() / 1000), 
            }),
        });

        if (!response.ok) {
            throw new Error("Something went wrong!" + response.statusText);
        } else {
            quoteInput.value = "";
            authorInput.value = "";
            fetchQuotes(); 
            alert("Quote added successfully!"); 
        }
    } catch (e) {
        console.log(e);
        alert("Failed to add quote. Please try again."); 
    }
}

async function deleteQuote(quoteId, listElement) {
    try {
        const response = await fetch(`http://localhost:3000/quotes/${quoteId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Something went wrong!" + response.statusText);
        } else {
            listElement.remove(); 
            alert("Quote deleted successfully!"); 
        }
    } catch (e) {
        console.log(e);
        alert("Failed to delete quote. Please try again.");
    }
}
