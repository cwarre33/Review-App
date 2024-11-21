const id = new URLSearchParams(window.location.search).get('id');
let review;
const url = `http://localhost:3000/reviews/${id}`;

const form = document.querySelector('form');
const ratingBox = form.querySelector('#rating');
const feedbackBox = form.querySelector('#feedback');
const submitBtn = form.querySelector('button');

window.addEventListener('DOMContentLoaded', fetchReview);

async function fetchReview() {
    try {
        const response = await fetch(url);
        if (!response.ok) 
            throw new Error(`Error ${response.url} ${response.statusText}`);
        review = await response.json();
        populateForm();
    } catch (error) {
        console.error(error.message);
    }
}

function populateForm() {
    ratingBox.value = review.rating;
    feedbackBox.value = review.feedback;
}

submitBtn.addEventListener('click', updateReview);

async function updateReview(e) {
    if(form.reportValidity()) {
        e.preventDefault();
        review.rating = parseInt(ratingBox.value);
        review.feedback = feedbackBox.value;
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(review)
            });
            if (!response.ok) {
                throw new Error(`Error ${response.url} ${response.statusText}`);
            }
            window.location.href = '/frontend/index.html';
        }catch (error) {
            console.error(error.message);
        } 
    }
}