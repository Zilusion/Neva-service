import { getReviewsConfig, submitReview } from "./api.js";

document.addEventListener('DOMContentLoaded', async () => {
	// ---------------------------
	// 1) ЛОГИКА ФОРМЫ ДОБАВЛЕНИЯ
	// ---------------------------
	const reviewForm = document.getElementById('review-form');
	const submitButton = reviewForm.querySelector('button[type="submit"]');

	const nameInput = document.getElementById('name');
	const reviewTextArea = document.getElementById('review');
	const rateRadios = document.getElementsByName('rate');
	const sourceInput = document.getElementById('source');

	function validateForm() {
		const nameFilled = nameInput.value.trim() !== '';
		const reviewFilled = reviewTextArea.value.trim() !== '';
		let rateSelected = false;
		rateRadios.forEach((radio) => {
			if (radio.checked) {
				rateSelected = true;
			}
		});

		if (nameFilled && reviewFilled && rateSelected) {
			submitButton.removeAttribute('disabled');
		} else {
			submitButton.setAttribute('disabled', '');
		}
	}

	nameInput.addEventListener('input', validateForm);
	reviewTextArea.addEventListener('input', validateForm);
	rateRadios.forEach((radio) => {
		radio.addEventListener('change', validateForm);
	});

	validateForm();

	reviewForm.addEventListener('submit', function (event) {
		event.preventDefault();

		const name = nameInput.value;
		const repairDate = document.getElementById('repair-date').value;
		const malfunctionType =
			document.getElementById('malfunction-type').value;
		const master = document.getElementById('master').value;
		const reviewText = reviewTextArea.value;
		let rate = '';
		rateRadios.forEach((radio) => {
			if (radio.checked) {
				rate = radio.value;
			}
		});

		const source = sourceInput.value; // 1,2,3

		const data = {
			name,
			repair_date: repairDate,
			malfunction_type: malfunctionType,
			master,
			review: reviewText,
			rate,
			source,
		};

		
		fetch('/submitReview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})
			.then((response) => response.json())
			.then((result) => {
				if (result.success) {
					alert('Ваш отзыв отправлен на модерацию!');
					reviewForm.reset();
					loadReviews(currentPage);
				} else {
					alert('Произошла ошибка при отправке отзыва.');
				}
			})
			.catch((err) => {
				console.error('Ошибка:', err);
			});
	});

	// ---------------------------------------
	// 2) ЛОГИКА ВЫВОДА ОТЗЫВОВ + ПАГИНАЦИЯ
	// ---------------------------------------
	let currentPage = 1;
	let limit = 50; // По ТЗ нужно 50 отзывов на странице
	const prevPageButton = document.getElementById('prev-page');
	const nextPageButton = document.getElementById('next-page');
	const currentPageSpan = document.getElementById('current-page');

	const configRes = await getReviewsConfig();
	if (configRes.success) {
		limit = configRes.limit;
	}

	prevPageButton.addEventListener('click', () => {
		if (currentPage > 1) {
			loadReviews(currentPage - 1);
		}
	});
	nextPageButton.addEventListener('click', () => {
		loadReviews(currentPage + 1);
	});

	// Функция загрузки отзывов
	function loadReviews(page) {
		const s = sourceInput.value;
		fetch(`/getPublicReviews?source=${s}&page=${page}`)
			.then((res) => res.json())
			.then((data) => {
				if (!data.success) {
					console.error('Ошибка при загрузке отзывов');
					return;
				}

				// 1) Обновляем блок статистики
				updateStatsBlock(data);

				// 2) Отрисовываем список отзывов
				renderReviewsList(data.reviews);

				// 3) Пагинация
				currentPage = page;
				currentPageSpan.textContent = page;
				nextPageButton.disabled = data.total <= page * limit;
				prevPageButton.disabled = page <= 1;
			})
			.catch((err) => console.error('Ошибка при загрузке отзывов:', err));
	}

	/**
	 * Обновить блок статистики
	 * data.avgRating, data.totalReviews, data.ratingDistribution
	 */
	function updateStatsBlock(data) {
		const average = data.avgRating ? data.avgRating.toFixed(1) : 0;
		const totalReviews = data.totalReviews;
		const dist = data.ratingDistribution;

		document.getElementById('stats-average').textContent = average;
		document.getElementById(
			'stats-count'
		).textContent = `${totalReviews} ${getDeclension(totalReviews, [
			'отзыв',
			'отзыва',
			'отзывов',
		])}`;
		document.getElementById('average-stars').innerHTML = renderStars(
			Math.round(average)
		);

		const statsItems = document.querySelectorAll('.review-stats__item');
		statsItems.forEach((item) => {
			const rate = parseInt(item.getAttribute('data-rate'), 10);
			const count = dist[rate] || 0;
			const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

			const countEl = item.querySelector('.review-stats__count');
			if (countEl) {
				countEl.textContent = count;
			}

			const progressBar = item.querySelector('.review-stats__progress');
			if (progressBar) {
				progressBar.style.width = percent.toFixed(1) + '%';
			}
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

	function renderReviewsList(reviews) {
		const reviewsContainer = document.getElementById('reviews');
		reviewsContainer.innerHTML = '';
		reviews.forEach((r) => {
			const reviewHTML = `
        <article class="review-card"
                 itemprop="review"
                 itemscope
                 itemtype="https://schema.org/Review">
          <header class="review-card__header">
            <span class="review-card__author"
                  itemprop="author"
                  itemscope
                  itemtype="https://schema.org/Person">
              <span itemprop="name">${r.Name}</span>
            </span>
            /
            <time class="review-card__date"
                  itemprop="datePublished"
                  datetime="${r.Send_date.split('T')[0] || ''}">
              ${r.Send_date.split('T')[0] || ''}
            </time>
          </header>

          <div class="review-card__body" itemprop="reviewBody">
            ${r.Review || ''}
          </div>

          <div class="review-card__meta">
            <div class="review-card__master">
              Мастер: <span>${r.Master || '—'}</span>
            </div>
            <div class="review-card__malfunction">
              Неисправность: <span>${r.Malfunction_type || '—'}</span>
            </div>
          </div>

          <div class="review-card__rate"
               itemprop="reviewRating"
               itemscope
               itemtype="https://schema.org/Rating">
            <meta itemprop="worstRating" content="1" />
            <meta itemprop="bestRating" content="5" />
            <strong>Оценка:</strong>
            <span itemprop="ratingValue">${r.Rate}</span> из 5

            <div class="review-card__stars">
              ${renderStars(r.Rate)}
            </div>
          </div>

          ${
				r.Comment
					? `
                <div class="review-card__answer">
                  <header class="review-card__answer-header">
                    <span class="review-card__answer-author">Нева-Сервис</span> /
                    <time class="review-card__answer-date">
                      ${r.Comment_date.split('T')[0] || ''}
                    </time>
                  </header>
                  <div class="review-card__answer-text">
                    ${r.Comment}
                  </div>
                </div>
              `
					: ''
			}
        </article>
      `;
			reviewsContainer.insertAdjacentHTML('beforeend', reviewHTML);
		});
	}

	function renderStars(rate) {
		const fullStar = `<span class="review-card__star review-card__star--filled"></span>`;
		const emptyStar = `<span class="review-card__star review-card__star--empty"></span>`;
		let html = '';
		for (let i = 1; i <= 5; i++) {
			html += i <= rate ? fullStar : emptyStar;
		}
		return html;
	}

	loadReviews(currentPage);
});
