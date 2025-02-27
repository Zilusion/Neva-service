document.addEventListener('DOMContentLoaded', function () {
	let currentPage = 1;

	const reviewsContainer = document.getElementById('reviews-container');

	const currentPageSpan = document.getElementById('current-page');
	const prevPageButton = document.getElementById('prev-page');
	const nextPageButton = document.getElementById('next-page');

	let sourcesList = [];
	let typesList = [];
	let marksList = [];
	let malfunctionsList = [];

	function loadSuggestions() {
		fetch('/getSources')
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					sourcesList = data.sources;
					console.log(sourcesList);
				}
			});
		fetch('/getTypes')
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					typesList = data.types;
					console.log(typesList);
				}
			});
		fetch('/getMarks')
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					marksList = data.marks;
					console.log(marksList);
				}
			});
		fetch('/getMalfunctions')
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					malfunctionsList = data.malfunctions;
					console.log(malfunctionsList);
				}
			});
	}

	loadSuggestions();

	prevPageButton.addEventListener('click', () => {
		if (currentPage > 1) {
			loadReviews(currentPage - 1);
		}
	});
	nextPageButton.addEventListener('click', () => {
		loadReviews(currentPage + 1);
	});

	function formatDateForInput(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		const offset = date.getTimezoneOffset();
		const localDate = new Date(date.getTime() - offset * 60000);
		return localDate.toISOString().split('T')[0];
	}

	function loadReviews(page) {
		fetch(`/getReviews?page=${page}`)
			.then((response) => response.json())
			.then((data) => {
				reviewsContainer.innerHTML = '';

				const totalReviews = data.total;
				const limit = 5;

				if (totalReviews > page * limit) {
					nextPageButton.removeAttribute('disabled');
				} else {
					nextPageButton.disabled = true;
				}

				if (page <= 1) {
					prevPageButton.disabled = true;
				} else {
					prevPageButton.removeAttribute('disabled');
				}

				data.reviews.forEach((review) => {
					reviewsContainer.appendChild(createReviewItem(review));
				});

				currentPageSpan.innerText = page;
				currentPage = page;
			})
			.catch((err) => console.error('Ошибка при загрузке отзывов:', err));
	}

	function createReviewItem(review) {
		const container = document.createElement('div');
		container.classList.add('review-item');

		const header = document.createElement('div');
		header.classList.add('review-item__header');
		header.innerHTML = `
      <div class="review-item__id">${review.id}</div>
      <div class="review-item__date">${formatDateForInput(
			review.Send_date
		)}</div>
      <div class="review-item__author">${review.Name}</div>
      <div class="review-item__rating">${review.Rate} из 5</div>
      <button type="button" class="review-item__toggle-button">
        <span class="review-item__toggle-icon"></span>
      </button>
      <div class="review-item__text">${review.Review}</div>
    `;
		container.appendChild(header);

		const details = document.createElement('div');
		details.classList.add('review-item__details');
		container.appendChild(details);

		const prefix = `review-item-${review.id}`;
		const form = document.createElement('form');
		form.classList.add('review-item__form');
		form.innerHTML = `
      <div class="review-item__row">
        <label for="${prefix}-id" class="review-item__label">ID:</label>
        <input id="${prefix}-id" class="review-item__input" type="text" name="id" value="${
			review.id
		}" readonly />
      </div>

      <div class="review-item__row">
        <label for="${prefix}-send-date" class="review-item__label">Дата поступления:</label>
        <input id="${prefix}-send-date" class="review-item__input" type="date" name="send_date" value="${formatDateForInput(
			review.Send_date
		)}" />
      </div>

      <div class="review-item__row">
        <label for="${prefix}-published" class="review-item__label">Опубликован:</label>
        <input id="${prefix}-published" class="review-item__input" type="checkbox" name="published" ${
			review.Published == 1 ? 'checked' : ''
		} />
      </div>

      <div class="review-item__row">
        <label for="${prefix}-name" class="review-item__label">Имя автора:</label>
        <input id="${prefix}-name" class="review-item__input" type="text" name="name" value="${
			review.Name
		}" required />
      </div>

      <div class="review-item__row">
        <label for="${prefix}-repair-date" class="review-item__label">Дата ремонта:</label>
        <input id="${prefix}-repair-date" class="review-item__input" type="date" name="repair_date" value="${formatDateForInput(
			review.Repair_date
		)}" />
      </div>

      <div class="review-item__row">
        <label for="${prefix}-malfunction-type" class="review-item__label">Тип неисправности:</label>
        <input id="${prefix}-malfunction-type" class="review-item__input" type="text" name="malfunction_type" value="${
			review.Malfunction_type || ''
		}" />
      </div>

      <div class="review-item__row">
        <label for="${prefix}-master" class="review-item__label">Мастер:</label>
        <input id="${prefix}-master" class="review-item__input" type="text" name="master" value="${
			review.Master || ''
		}" />
      </div>
	  
	  <div class="review-item__row">
		<label for="${prefix}-source-ts-control" class="review-item__label">Источник:</label>
		<select id="${prefix}-source" name="source"></select>
	  </div>

	  <div class="review-item__row">
		  <label for="${prefix}-type-ts-control" class="review-item__label">Тип техники:</label>
		  <select id="${prefix}-type" name="type"></select>
	  </div>

	  <div class="review-item__row">
		  <label for="${prefix}-mark-ts-control" class="review-item__label">Марка:</label>
		  <select id="${prefix}-mark" name="mark"></select>
	  </div>

	  <div class="review-item__row">
		  <label for="${prefix}-malfunctions-ts-control" class="review-item__label">Неисправности:</label>
		  <select id="${prefix}-malfunctions" multiple name="malfunctions"></select>
	  </div>
	  
      <div class="review-item__row">
        <label class="review-item__label">Оценка:</label>
        <div class="review-item__radio-group">
          ${[1, 2, 3, 4, 5]
				.map(
					(val) => `
            <label class="review-item__radio-label" for="${prefix}-rate-${val}">
              <input id="${prefix}-rate-${val}" type="radio" name="rate" value="${val}" ${
						review.Rate == val ? 'checked' : ''
					} required />${val}
            </label>
          `
				)
				.join('')}
        </div>
      </div>

      <div class="review-item__row">
        <label for="${prefix}-review" class="review-item__label">Текст отзыва:</label>
        <textarea id="${prefix}-review" class="review-item__textarea" name="review" required>${
			review.Review || ''
		}</textarea>
      </div>

      <div class="review-item__row">
        <label for="${prefix}-comment" class="review-item__label">Комментарий компании:</label>
        <textarea id="${prefix}-comment" class="review-item__textarea" name="comment">${
			review.Comment || ''
		}</textarea>
      </div>

      <div class="review-item__row">
        <label for="${prefix}-comment-date" class="review-item__label">Дата комментария:</label>
        <input id="${prefix}-comment-date" class="review-item__input" type="date" name="comment_date" value="${formatDateForInput(
			review.Comment_date
		)}" />
      </div>

      <div class="review-item__row review-item__row--buttons">
        <button type="submit" class="review-item__button review-item__button--update">Изменить отзыв</button>
        <button type="button" class="review-item__button review-item__button--delete">Удалить отзыв</button>
      </div>
    `;

		details.appendChild(form);

		const sourceSelect = new TomSelect(
			details.querySelector(`#${prefix}-source`),
			{
				valueField: 'id',
				labelField: 'Name',
				searchField: 'Name',
				options: sourcesList,
				maxItems: 1,
				create: false,
				placeholder: 'Начните вводить источник...',
			}
		);

		if (review.Source) {
			sourceSelect.setValue(review.Source, true);
		} else {
			sourceSelect.setValue('Неизвестно', true);
		}

		const typeSelect = new TomSelect(
			details.querySelector(`#${prefix}-type`),
			{
				valueField: 'Name',
				labelField: 'Name',
				searchField: 'Name',
				options: typesList,
				maxItems: 1,
				create: false,
				placeholder: 'Начните вводить тип техники...',
			}
		);

		if (review.Type) {
			typeSelect.setValue(review.Type, true);
		}

		const markSelect = new TomSelect(
			details.querySelector(`#${prefix}-mark`),
			{
				valueField: 'Name',
				labelField: 'Name',
				searchField: 'Name',
				options: marksList,
				maxItems: 1,
				create: false,
				placeholder: 'Начните вводить марку...',
			}
		);

		if (review.Mark) {
			markSelect.setValue(review.Mark, true);
		}

		const malfunctionsSelect = new TomSelect(
			details.querySelector(`#${prefix}-malfunctions`),
			{
				valueField: 'id',
				labelField: 'Name',
				searchField: 'Name',
				options: malfunctionsList,
				maxItems: null,
				create: false,
				placeholder: 'Начните вводить неисправность...',
			}
		);

		if (review.Malfunctions) {
			const selectedIDs = review.Malfunctions.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			malfunctionsSelect.setValue(selectedIDs, true);
		}

		const toggleButton = header.querySelector(
			'.review-item__toggle-button'
		);

		toggleButton.addEventListener('click', () => {
			if (!details.classList.contains('review-item__details--open')) {
				details.classList.add('review-item__details--open');
				toggleButton.classList.add('review-item__toggle-button--open');

				const commentDateInput = form.querySelector(
					`[name='comment_date']`
				);
				if (!commentDateInput.value) {
					commentDateInput.value = new Date()
						.toISOString()
						.split('T')[0];
				}
			} else {
				details.classList.remove('review-item__details--open');
				toggleButton.classList.remove('review-item__toggle-button--open');
			}
		});

		form.addEventListener('submit', (event) => {
			event.preventDefault();
			if (!confirm('Вы собираетесь обновить отзыв. Продолжить?')) {
				return;
			}

			const formData = new FormData(form);
			const dataToSend = {
				id: formData.get('id'),
				send_date: formData.get('send_date'),
				published: formData.get('published') ? 1 : 0,
				name: formData.get('name'),
				repair_date: formData.get('repair_date'),
				malfunction_type: formData.get('malfunction_type'),
				master: formData.get('master'),
				rate: formData.get('rate'),
				review: formData.get('review'),
				comment: formData.get('comment'),
				comment_date: formData.get('comment_date'),
				source: formData.get('source'),
				type: formData.get('type'),
				mark: formData.get('mark'),
				malfunctions: formData.getAll('malfunctions').join(','),
			};
			console.log(dataToSend);

			fetch('/updateReview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(dataToSend),
			})
				.then((response) => response.json())
				.then((result) => {
					if (result.success) {
						alert('Отзыв обновлён.');
						container.classList.add('review-item--updating');
						if (result.updatedReview) {
							setTimeout(() => {
								updateReviewItemUI(
									container,
									result.updatedReview
								);
								container.classList.remove(
									'review-item--updating'
								);
							}, 1000);
						}
					} else {
						alert('Ошибка обновления отзыва.');
					}
				})
				.catch((err) =>
					console.error('Ошибка при обновлении отзыва:', err)
				);
		});

		form.querySelector('.review-item__button--delete').addEventListener(
			'click',
			() => {
				if (!confirm('Вы собираетесь удалить отзыв. Продолжить?')) {
					return;
				}
				const id = form.querySelector("input[name='id']").value;
				fetch('/deleteReview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id }),
				})
					.then((response) => response.json())
					.then((result) => {
						if (result.success) {
							alert('Отзыв удалён.');
							container.classList.add('review-item--deletion');
							setTimeout(() => {
								container.remove();
							}, 1000);
						} else {
							alert('Ошибка при удалении отзыва.');
						}
					})
					.catch((err) =>
						console.error('Ошибка при удалении отзыва:', err)
					);
			}
		);

		return container;
	}

	// function updateReviewItemUI(container, review) {
	// 	const prefix = `review-item-${review.id}`;
	// 	const header = container.querySelector('.review-item__header');
	// 	header.innerHTML = `
    //   <div class="review-item__id">${review.id}</div>
    //   <div class="review-item__date">${formatDateForInput(
	// 		review.Send_date
	// 	)}</div>
    //   <div class="review-item__author">${review.Name}</div>
    //   <div class="review-item__rating">${review.Rate} из 5</div>
    //   <button type="button" class="review-item__toggle-button">
    //     <span class="review-item__toggle-icon">
    //       <svg>…</svg>
    //     </span>
    //   </button>
    //   <div class="review-item__text">${review.Review || ''}</div>
    // `;

	// 	const details = container.querySelector('.review-item__details');
	// 	details.classList.add('review-item__details--open');

	// 	const form = details.querySelector('.review-item__form');
	// 	form.querySelector(`#${prefix}-send-date`).value = formatDateForInput(
	// 		review.Send_date
	// 	);
	// 	form.querySelector(`#${prefix}-published`).checked =
	// 		review.Published == 1;
	// 	form.querySelector(`#${prefix}-name`).value = review.Name;
	// 	form.querySelector(`#${prefix}-repair-date`).value = formatDateForInput(
	// 		review.Repair_date
	// 	);
	// 	form.querySelector(`#${prefix}-malfunction-type`).value =
	// 		review.Malfunction_type || '';
	// 	form.querySelector(`#${prefix}-master`).value = review.Master || '';
	// 	const rateInputs = form.querySelectorAll("input[name='rate']");
	// 	rateInputs.forEach((radio) => {
	// 		radio.checked = Number(radio.value) === Number(review.Rate);
	// 	});
	// 	form.querySelector(`#${prefix}-review`).value = review.Review || '';
	// 	form.querySelector(`#${prefix}-comment`).value = review.Comment || '';
	// 	form.querySelector(`#${prefix}-comment-date`).value =
	// 		formatDateForInput(review.Comment_date);

	// 	// Обновляем новые поля
	// 	form.querySelector(`#${prefix}-source`).value = review.Source;
	// 	form.querySelector(`#${prefix}-type`).value = review.Type || '';
	// 	form.querySelector(`#${prefix}-mark`).value = review.Mark || '';
	// 	form.querySelector(`#${prefix}-malfunctions`).value =
	// 		review.Malfunctions || '';

	// 	const toggleButton = header.querySelector(
	// 		'.review-item__toggle-button'
	// 	);
	// 	toggleButton.addEventListener('click', () => {
	// 		if (!details.classList.contains('review-item__details--open')) {
	// 			details.classList.add('review-item__details--open');
	// 			toggleButton.innerHTML = `
    //       <span class="review-item__toggle-icon">
    //         <svg>…</svg>
    //       </span>
    //     `;
	// 		} else {
	// 			details.classList.remove('review-item__details--open');
	// 			toggleButton.innerHTML = `
    //       <span class="review-item__toggle-icon">
    //         <svg>…</svg>
    //       </span>
    //     `;
	// 		}
	// 	});
	// }

	loadReviews(currentPage);
});
