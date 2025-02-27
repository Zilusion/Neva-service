import {
	submitReview,
	getPublicReviews,
	getReviewsConfig,
} from '../common/js/api.js';
import { renderReviewCard, renderStars } from './reviewUi.js';

document.addEventListener('DOMContentLoaded', async () => {
	let currentPage = 1;
	let limit = 50; // Значение по умолчанию, заменяется из конфигурации
	const configRes = await getReviewsConfig();
	if (configRes.success) {
		limit = configRes.limit;
	}

	const reviewForm = document.getElementById('review-form');
	const reviewsContainer = document.getElementById('reviews');
	const statsAverageEl = document.getElementById('stats-average');
	const statsAverageStars = document.getElementById('average-stars');
	const statsCountEl = document.getElementById('stats-count');
	const statsItems = document.querySelectorAll('.review-stats__item');
	const currentPageSpan = document.getElementById('current-page');
	const prevPageButton = document.getElementById('prev-page');
	const nextPageButton = document.getElementById('next-page');
	const sourceInput = document.getElementById('source');

	reviewForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const formData = new FormData(reviewForm);
		const data = {
			name: formData.get('name'),
			repair_date: formData.get('repair_date'),
			malfunction_type: formData.get('malfunction_type'),
			master: formData.get('master'),
			review: formData.get('review'),
			rate: formData.get('rate'),
			source: formData.get('source'),
		};
		const res = await submitReview(data);
		if (res.success) {
			alert('Ваш отзыв отправлен на модерацию!');
			reviewForm.reset();
			loadAndRenderReviews(currentPage);
		} else {
			alert('Ошибка при отправке отзыва.');
		}
	});

	prevPageButton.addEventListener('click', () => {
		if (currentPage > 1) {
			loadAndRenderReviews(currentPage - 1);
		}
	});
	nextPageButton.addEventListener('click', () => {
		loadAndRenderReviews(currentPage + 1);
	});

	async function loadAndRenderReviews(page) {
		const source = sourceInput.value;
		const data = await getPublicReviews(source, page);
		reviewsContainer.innerHTML = '';

		updateStatsBlock(data);
		data.reviews.forEach((review) => {
			const card = renderReviewCard(review);
			reviewsContainer.appendChild(card);
		});

		currentPage = page;
		currentPageSpan.textContent = page;

		nextPageButton.disabled = data.total <= page * limit;
		prevPageButton.disabled = page <= 1;
	}

	function updateStatsBlock(data) {
		const average = data.avgRating ? data.avgRating.toFixed(1) : '0';
		const total = data.totalReviews || 0;
		statsAverageEl.textContent = average;
		statsAverageStars.innerHTML = renderStars(Math.round(average));
		statsCountEl.textContent = `${total} ${getDeclension(total, [
			'отзыва',
			'отзывов',
			'отзывов',
		])}`;

		statsItems.forEach((item) => {
			const rate = parseInt(item.getAttribute('data-rate'), 10);
			const count = data.ratingDistribution[rate] || 0;
			const percent = total > 0 ? (count / total) * 100 : 0;
			item.setAttribute('data-percent', percent.toFixed(1));
			const countEl = item.querySelector('.review-stats__count');
			if (countEl) countEl.textContent = count;
			const progressEl = item.querySelector('.review-stats__progress');
			if (progressEl) progressEl.style.width = percent.toFixed(1) + '%';
		});
	}

	function getDeclension(number, titles) {
		const cases = [2, 0, 1, 1, 1, 2];
		return titles[
			number % 100 > 4 && number % 100 < 20
				? 2
				: cases[number % 10 < 5 ? number % 10 : 5]
		];
	}

	loadAndRenderReviews(currentPage);
});
