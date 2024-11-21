const url = 'http://localhost:3000/reviews';
let reviews = [];

const totalSpan = document.querySelector('.total');
const scaleSpan = document.querySelector('.scale');
const averageDiv = document.querySelector('.average');
const middleSection = document.querySelector('.middle-section');
const reviewContainer = document.querySelector('.review-container');
const form = document.querySelector('form');
const ratingBox = form.querySelector('#rating');
const feedbackBox = form.querySelector('#feedback');
const submitBtn = form.querySelector('button');


const selectElement = document.querySelector('#order'); // Match the select element by its ID

window.addEventListener('DOMContentLoaded', fetchReviews);

// Fetch reviews sorted by default (highest to lowest rating)
async function fetchReviews() {
    try {
        const response = await fetch(`${url}?_sort=rating&_order=desc`); // Fetch sorted by descending order
        if (!response.ok) 
            throw new Error(`Error ${response.url} ${response.statusText}`);
        reviews = await response.json();
        loadStats();
        loadReviews();
    } catch (error) {
        console.error(error.message);
    }
}

// Sort reviews dynamically based on the selected option
function sortReviews() {
    const sortOption = selectElement.value; // Get the current value of the select element
    if (sortOption === 'ascending') {
        reviews.sort((a, b) => a.rating - b.rating); // Ascending order
    } else {
        reviews.sort((a, b) => b.rating - a.rating); // Descending order
    }
    loadReviews(); // Reload reviews after sorting
}

// Event listener for sort selection changes
selectElement.addEventListener('change', sortReviews);


function loadStats() {
    let numberOfReviews = reviews.length;
    let total = reviews.reduce((accumulator, review) => accumulator + parseInt(review.rating), 0);
    let average = total / numberOfReviews;
    let scale;
    if (average >= 4.5) {
        scale = 'Excellent';
    } else if (average >= 4) {
        scale = 'Good';
    } else if (average >= 3) {
        scale = 'Fair';
    } else if (average >= 2) {
        scale = 'Poor';
    } else {
        scale = 'Awful';
    }
    totalSpan.textContent = `${numberOfReviews} Reviews`;
    averageDiv.textContent = average;
    scaleSpan.textContent = scale;

    if(middleSection.classList.contains('hidden'))
        middleSection.classList.remove('hidden');
} 

function loadReviews() {
    const fragment = document.createDocumentFragment();
    reviews.forEach(review=>fragment.appendChild(generateReview(review)));
    reviewContainer.innerHTML = '';
    reviewContainer.append(fragment);
}

//generate DOM Element for the review
function generateReview(review) {
    const container = document.createElement('div');
    container.classList.add('review-item', 'card', 'flex');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('btn-container');
    const editBtn = document.createElement('a');
    editBtn.classList.add('btn', 'edit');
    editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
    editBtn.href = `edit.html?id=${review.id}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'delete');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener('click', async ()=> await deleteReview(review.id));
    buttonContainer.append(editBtn, deleteBtn);

    const starContainer = document.createElement('div');
    starContainer.classList.add('star-container');

    for (let i = 0; i < review.rating; i++) {
        const star = document.createElement('i');
        star.classList.add('fa-solid', 'fa-star');
        starContainer.appendChild(star);
    }

    for (let i = review.rating; i < 5; i++) {
        const star = document.createElement('i');
        star.classList.add('fa-regular', 'fa-star');
        starContainer.appendChild(star);
    }

    const feedBackContainer = document.createElement('div');
    feedBackContainer.classList.add('feedback');
    feedBackContainer.textContent = review.feedback;

    container.append(buttonContainer, starContainer, feedBackContainer);
    return container;
}

submitBtn.addEventListener('click', submitReview);

async function submitReview(e) {
    if (form.reportValidity()) {
        e.preventDefault();
        let rating = parseInt(ratingBox.value);
        let feedback = feedbackBox.value;

        ratingBox.value = '';
        feedbackBox.value = '';

        let review = { rating, feedback };
        review = JSON.stringify(review);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: review,
            });
            if (!response.ok) 
                throw new Error(`Error ${response.url} ${response.statusText}`);
            
            review = await response.json();
            reviews.push(review);
            loadStats();
            sortReviews(); // Sort after adding a new review
        } catch (error) {
            console.error(error.message);
        }
    }
}

async function deleteReview(id) {
    const response = await fetch(`${url}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error(`Error ${response.url} ${response.statusText}`);
    }
    let index = reviews.findIndex(review => review.id === id);
    if (index !== -1) {
        reviews.splice(index, 1);
        loadStats();
        loadReviews();
    }

}