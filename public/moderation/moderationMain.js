import {
	getModerationConfig,
	getReviews,
	getSources,
	getTypes,
	getMarks,
	getMalfunctions,
} from './../common/js/api.js';
import { createReviewItem, updateReviewItemUI } from './moderationUi.js';

document.addEventListener('DOMContentLoaded', async () => {
	let currentPage = 1;
	let limit = 20; // Значение по умолчанию, заменяется из конфигурации
	const configRes = await getModerationConfig();
	if (configRes.success) {
		limit = configRes.limit;
	}

	const reviewsContainer = document.getElementById('reviews');
	const currentPageSpan = document.getElementById('current-page');
	const prevPageButton = document.getElementById('prev-page');
	const nextPageButton = document.getElementById('next-page');

	let sourcesList = [];
	let typesList = [];
	let marksList = [];
	let malfunctionsList = [];

	async function loadSuggestions() {
		let data;
		data = await getSources();
		if (data.success) sourcesList = data.sources;
		data = await getTypes();
		if (data.success) typesList = data.types;
		data = await getMarks();
		if (data.success) marksList = data.marks;
		data = await getMalfunctions();
		if (data.success) malfunctionsList = data.malfunctions;
	}
	await loadSuggestions();

	prevPageButton.addEventListener('click', () => {
		if (currentPage > 1) {
			loadAndRenderReviews(currentPage - 1);
		}
	});
	nextPageButton.addEventListener('click', () => {
		loadAndRenderReviews(currentPage + 1);
	});

	async function loadAndRenderReviews(page) {
		const data = await getReviews(page);
		reviewsContainer.innerHTML = '';

		data.reviews.forEach((review) => {
			const reviewEl = createReviewItem(review, {
				sourcesList,
				typesList,
				marksList,
				malfunctionsList,
				onUpdate: handleUpdate,
				onDelete: handleDelete,
			});
			reviewsContainer.appendChild(reviewEl);
		});

		currentPage = page;
		currentPageSpan.textContent = page;

		nextPageButton.disabled = data.total <= page * limit;
		prevPageButton.disabled = page <= 1;
	}

	async function handleUpdate(dataToSend, container) {
		const res = await fetch('/updateReview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dataToSend),
		});
		const result = await res.json();
		if (result.success) {
			alert('Отзыв обновлён');
			container.classList.add('review-item--updating');
			setTimeout(
				() => container.classList.remove('review-item--updating'),
				1000
			);
			updateReviewItemUI(container, result.updatedReview);
		} else {
			alert('Ошибка обновления отзыва');
		}
	}

	async function handleDelete(id, container) {
		const res = await fetch('/deleteReview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id }),
		});
		const result = await res.json();
		if (result.success) {
			alert('Отзыв удалён');
			container.classList.add('review-item--deletion');
			setTimeout(() => {
				container.classList.remove('review-item--deletion');
				container.remove();
			}, 1000);
		} else {
			alert('Ошибка при удалении отзыва');
		}
	}

	loadAndRenderReviews(currentPage);
});
