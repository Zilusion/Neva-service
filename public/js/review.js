document.addEventListener('DOMContentLoaded', function () {
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

		// Если все обязательные поля заполнены - разблокируем кнопку
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

	// Проверяем форму при первой загрузке
	validateForm();

	// Обработка отправки формы
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

		const source = sourceInput.value; // 1, 2 или 3 (зависит от страницы)

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
					// После добавления отзыва сразу обновим список
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
	const limit = 5; // по ТЗ нужно 50 отзывов на странице
	const prevPageButton = document.getElementById('prev-page');
	const nextPageButton = document.getElementById('next-page');
	const currentPageSpan = document.getElementById('current-page');

	// Кнопка "Назад"
	prevPageButton.addEventListener('click', () => {
		if (currentPage > 1) {
			currentPage--;
			loadReviews(currentPage);
		}
	});

	// Кнопка "Вперёд"
	nextPageButton.addEventListener('click', () => {
		currentPage++;
		loadReviews(currentPage);
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
				const avg = data.avgRating ? data.avgRating.toFixed(1) : 0;
				const totalReviews = data.totalReviews; // общее число опубликованных отзывов
				const dist = data.ratingDistribution; // {1: x, 2: y, 3: z, 4: w, 5: v}

				const statsBlock = document.getElementById('stats-block');
				statsBlock.innerHTML = `
          <p>Общая оценка ${avg} из 5 на основании ${totalReviews} отзывов</p>
          <ul>
            <li>5 звёзд – ${dist[5] || 0}</li>
            <li>4 звезды – ${dist[4] || 0}</li>
            <li>3 звезды – ${dist[3] || 0}</li>
            <li>2 звезды – ${dist[2] || 0}</li>
            <li>1 звезда – ${dist[1] || 0}</li>
          </ul>
        `;

				// 2) Отрисовываем список отзывов
				const reviewsContainer =
					document.getElementById('reviews-container');
				reviewsContainer.innerHTML = '';
				data.reviews.forEach((r) => {
					// Разметка schema.org
					const reviewHTML = `
            <div class="review-item"
                 itemprop="review"
                 itemscope
                 itemtype="https://schema.org/Review">
              
              <div class="review-author">
                <span itemprop="author" itemscope itemtype="https://schema.org/Person">
                  <span itemprop="name">${r.Name}</span>
                </span>
                /
                <span itemprop="datePublished">${r.Send_date || ''}</span>
              </div>
              
              <div class="review-text" itemprop="reviewBody">
                ${r.Review}
              </div>
              
              <div class="review-rate"
                   itemprop="reviewRating"
                   itemscope
                   itemtype="https://schema.org/Rating">
                <strong>Оценка</strong>
                <meta itemprop="worstRating" content="1">
                <span itemprop="ratingValue">${r.Rate}</span>
                из
                <span itemprop="bestRating">5</span>
                <img src="/images/rates/${r.Rate}.png" alt="${
						r.Rate
					} баллов" title="${r.Rate} баллов">
              </div>

              ${
					r.Comment
						? `
                  <div class="review-answer">
                    <div class="answer-wrap">
                      <div class="review-author">
                        Нева-Сервис / ${r.Comment_date || ''}
                      </div>
                      <span class="answer-text">${r.Comment}</span>
                    </div>
                  </div>
                `
						: ''
				}
            </div>
          `;
					reviewsContainer.insertAdjacentHTML(
						'beforeend',
						reviewHTML
					);
				});

				// 3) Настраиваем пагинацию
				// Кол-во отзывов, попавших на текущую страницу
				const pageTotal = data.total; // из SQL_CALC_FOUND_ROWS
				// А общее число опубликованных - data.totalReviews
				// Кол-во страниц:
				const totalPages = Math.ceil(data.totalReviews / limit);

				// Текущая страница
				currentPageSpan.textContent = page;

				// Отключаем/включаем кнопки
				prevPageButton.disabled = page <= 1;
				nextPageButton.disabled = page >= totalPages;
			})
			.catch((err) => console.error('Ошибка при загрузке отзывов:', err));
	}

	// При загрузке страницы получаем отзывы за 1-ю страницу
	loadReviews(currentPage);
});
