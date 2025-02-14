document.addEventListener('DOMContentLoaded', function () {
	let currentPage = 1;

	const reviewsContainer = document.getElementById('reviews-container');
	const currentPageSpan = document.getElementById('current-page');
	const prevPageButton = document.getElementById('prev-page');
	const nextPageButton = document.getElementById('next-page');

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
				const limit = 20;

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
    		<div class="review-item__date">${formatDateForInput(review.Send_date)}</div>
    		<div class="review-item__author">${review.Name}</div>
    		<div class="review-item__rating">${review.Rate} из 5</div>
    		<button type="button" class="review-item__toggle-button">
    		  <span class="review-item__toggle-icon">
					<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><g><g id="_x39__36_"><g><path d="M155.104,345.551L72.866,512.053c-6.904,18.742,8.09,35.534,26.833,26.832l166.387-82.295 c7.172-1.396,14.134-4.169,19.68-9.734l295.558-295.768c14.841-14.841,14.841-38.919,0-53.779l-67.167-67.225 c-14.841-14.841-38.9-14.841-53.741,0L164.838,325.852C159.292,331.417,156.5,338.379,155.104,345.551z M473.841,70.418 c7.421-7.421,19.45-7.421,26.871,0l40.296,40.334c7.421,7.42,7.421,19.469,0,26.89l-40.296,40.334l-66.211-68.18L473.841,70.418z M406.196,138.121l67.645,66.747L258.876,419.966c-25.188-25.207-60.033-60.071-67.167-67.225L406.196,138.121z M225.407,440.238 l-102.739,62.232c-9.372,4.342-17.768-4.646-13.407-13.426l62.194-102.815L225.407,440.238z M573.75,229.5v306 c0,20.999-20.77,38.479-41.75,38.479H76.003c-20.98,0-38.001-17.021-38.001-38.021V79.656c0-21,17.519-41.406,38.499-41.406h306 V0h-306C34.521,0,0,37.657,0,79.656v456.303C0,577.957,34.023,612,76.003,612H532c41.979,0,80-34.502,80-76.5v-306H573.75z"/></g></g></g></svg>
				</span>
    		</button>
    		<div class="review-item__text">${review.Review || ''}</div>
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
        		<label class="review-item__label">Оценка:</label>
        		<div class="review-item__radio-group">
          			${[1, 2, 3, 4, 5]
						.map(
							(val) => `
              					<label class="review-item__radio-label" for="${prefix}-rate-${val}">
                				<input id="${prefix}-rate-${val}" type="radio" name="rate" value="${val}" ${
								review.Rate == val ? 'checked' : ''
							} required />${val}
							 </label>`
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

		const toggleButton = header.querySelector(
			'.review-item__toggle-button'
		);

		toggleButton.addEventListener('click', () => {
			if (!details.classList.contains('review-item__details--open')) {
				details.classList.add('review-item__details--open');
				toggleButton.innerHTML = `
        	<span class="review-item__toggle-icon">
				<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><g><g id="_x39__4_"><g><path d="M535.5,0h-459C34.253,0,0,34.253,0,76.5v459C0,577.747,34.253,612,76.5,612h459c42.247,0,76.5-34.253,76.5-76.5v-459 C612,34.253,577.747,0,535.5,0z M573.75,535.5c0,21.114-17.117,38.25-38.25,38.25h-459c-21.133,0-38.25-17.136-38.25-38.25v-459 c0-21.133,17.136-38.25,38.25-38.25h459c21.133,0,38.25,17.117,38.25,38.25V535.5z M322.811,161.874 c-4.59-4.571-10.882-6.005-16.811-4.953c-5.929-1.052-12.221,0.382-16.811,4.972l-108.19,108.19 c-7.478,7.459-7.478,19.584,0,27.043c7.478,7.478,19.584,7.478,27.043,0l78.833-78.833V420.75 c0,10.557,8.568,19.125,19.125,19.125c10.557,0,19.125-8.568,19.125-19.125V218.293l78.814,78.814 c7.478,7.478,19.584,7.478,27.042,0c7.479-7.478,7.479-19.584,0-27.043L322.811,161.874z"/></g></g></g></svg>
			</span>
        	`;
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
				toggleButton.innerHTML = `
        	<span class="review-item__toggle-icon">
				<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><g><g id="_x39__36_"><g><path d="M155.104,345.551L72.866,512.053c-6.904,18.742,8.09,35.534,26.833,26.832l166.387-82.295 c7.172-1.396,14.134-4.169,19.68-9.734l295.558-295.768c14.841-14.841,14.841-38.919,0-53.779l-67.167-67.225 c-14.841-14.841-38.9-14.841-53.741,0L164.838,325.852C159.292,331.417,156.5,338.379,155.104,345.551z M473.841,70.418 c7.421-7.421,19.45-7.421,26.871,0l40.296,40.334c7.421,7.42,7.421,19.469,0,26.89l-40.296,40.334l-66.211-68.18L473.841,70.418z M406.196,138.121l67.645,66.747L258.876,419.966c-25.188-25.207-60.033-60.071-67.167-67.225L406.196,138.121z M225.407,440.238 l-102.739,62.232c-9.372,4.342-17.768-4.646-13.407-13.426l62.194-102.815L225.407,440.238z M573.75,229.5v306 c0,20.999-20.77,38.479-41.75,38.479H76.003c-20.98,0-38.001-17.021-38.001-38.021V79.656c0-21,17.519-41.406,38.499-41.406h306 V0h-306C34.521,0,0,37.657,0,79.656v456.303C0,577.957,34.023,612,76.003,612H532c41.979,0,80-34.502,80-76.5v-306H573.75z"/></g></g></g></svg>
			</span>
        	`;
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
			};

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

	function updateReviewItemUI(container, review) {
		const prefix = `review-item-${review.id}`;
		const header = container.querySelector('.review-item__header');
		header.innerHTML = `
      		<div class="review-item__id">${review.id}</div>
      		<div class="review-item__date">${formatDateForInput(
				review.Send_date
			)}</div>
      		<div class="review-item__author">${review.Name}</div>
      		<div class="review-item__rating">${review.Rate} из 5</div>
      		<button type="button" class="review-item__toggle-button">
      			<span class="review-item__toggle-icon">
					<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><g><g id="_x39__4_"><g><path d="M535.5,0h-459C34.253,0,0,34.253,0,76.5v459C0,577.747,34.253,612,76.5,612h459c42.247,0,76.5-34.253,76.5-76.5v-459 C612,34.253,577.747,0,535.5,0z M573.75,535.5c0,21.114-17.117,38.25-38.25,38.25h-459c-21.133,0-38.25-17.136-38.25-38.25v-459 c0-21.133,17.136-38.25,38.25-38.25h459c21.133,0,38.25,17.117,38.25,38.25V535.5z M322.811,161.874 c-4.59-4.571-10.882-6.005-16.811-4.953c-5.929-1.052-12.221,0.382-16.811,4.972l-108.19,108.19 c-7.478,7.459-7.478,19.584,0,27.043c7.478,7.478,19.584,7.478,27.043,0l78.833-78.833V420.75 c0,10.557,8.568,19.125,19.125,19.125c10.557,0,19.125-8.568,19.125-19.125V218.293l78.814,78.814 c7.478,7.478,19.584,7.478,27.042,0c7.479-7.478,7.479-19.584,0-27.043L322.811,161.874z"/></g></g></g></svg>
				</span>
      		</button>
      		<div class="review-item__text">${review.Review || ''}</div>
    	`;

		const details = container.querySelector('.review-item__details');
		details.classList.add('review-item__details--open');

		const form = details.querySelector('.review-item__form');
		form.querySelector(`#${prefix}-send-date`).value = formatDateForInput(
			review.Send_date
		);
		form.querySelector(`#${prefix}-published`).checked =
			review.Published == 1;
		form.querySelector(`#${prefix}-name`).value = review.Name;
		form.querySelector(`#${prefix}-repair-date`).value = formatDateForInput(
			review.Repair_date
		);
		form.querySelector(`#${prefix}-malfunction-type`).value =
			review.Malfunction_type || '';
		form.querySelector(`#${prefix}-master`).value = review.Master || '';

		const rateInputs = form.querySelectorAll("input[name='rate']");
		rateInputs.forEach((radio) => {
			radio.checked = Number(radio.value) === Number(review.Rate);
		});
		form.querySelector(`#${prefix}-review`).value = review.Review || '';
		form.querySelector(`#${prefix}-comment`).value = review.Comment || '';
		form.querySelector(`#${prefix}-comment-date`).value =
			formatDateForInput(review.Comment_date);

		const toggleButton = header.querySelector(
			'.review-item__toggle-button'
		);
		toggleButton.addEventListener('click', () => {
			if (!details.classList.contains('review-item__details--open')) {
				details.classList.add('review-item__details--open');

				toggleButton.innerHTML = `
          			<span class="review-item__toggle-icon">
		  				<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><g><g id="_x39__4_"><g><path d="M535.5,0h-459C34.253,0,0,34.253,0,76.5v459C0,577.747,34.253,612,76.5,612h459c42.247,0,76.5-34.253,76.5-76.5v-459 C612,34.253,577.747,0,535.5,0z M573.75,535.5c0,21.114-17.117,38.25-38.25,38.25h-459c-21.133,0-38.25-17.136-38.25-38.25v-459 c0-21.133,17.136-38.25,38.25-38.25h459c21.133,0,38.25,17.117,38.25,38.25V535.5z M322.811,161.874 c-4.59-4.571-10.882-6.005-16.811-4.953c-5.929-1.052-12.221,0.382-16.811,4.972l-108.19,108.19 c-7.478,7.459-7.478,19.584,0,27.043c7.478,7.478,19.584,7.478,27.043,0l78.833-78.833V420.75 c0,10.557,8.568,19.125,19.125,19.125c10.557,0,19.125-8.568,19.125-19.125V218.293l78.814,78.814 c7.478,7.478,19.584,7.478,27.042,0c7.479-7.478,7.479-19.584,0-27.043L322.811,161.874z"/></g></g></g></svg>
		  			</span>
        		`;
			} else {
				details.classList.remove('review-item__details--open');
				toggleButton.innerHTML = `
          			<span class="review-item__toggle-icon">
						<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><g><g id="_x39__36_"><g><path d="M155.104,345.551L72.866,512.053c-6.904,18.742,8.09,35.534,26.833,26.832l166.387-82.295 c7.172-1.396,14.134-4.169,19.68-9.734l295.558-295.768c14.841-14.841,14.841-38.919,0-53.779l-67.167-67.225 c-14.841-14.841-38.9-14.841-53.741,0L164.838,325.852C159.292,331.417,156.5,338.379,155.104,345.551z M473.841,70.418 c7.421-7.421,19.45-7.421,26.871,0l40.296,40.334c7.421,7.42,7.421,19.469,0,26.89l-40.296,40.334l-66.211-68.18L473.841,70.418z M406.196,138.121l67.645,66.747L258.876,419.966c-25.188-25.207-60.033-60.071-67.167-67.225L406.196,138.121z M225.407,440.238 l-102.739,62.232c-9.372,4.342-17.768-4.646-13.407-13.426l62.194-102.815L225.407,440.238z M573.75,229.5v306 c0,20.999-20.77,38.479-41.75,38.479H76.003c-20.98,0-38.001-17.021-38.001-38.021V79.656c0-21,17.519-41.406,38.499-41.406h306 V0h-306C34.521,0,0,37.657,0,79.656v456.303C0,577.957,34.023,612,76.003,612H532c41.979,0,80-34.502,80-76.5v-306H573.75z"/></g></g></g></svg>
		  			</span>
        		`;
			}
		});
	}

	loadReviews(1);
});
