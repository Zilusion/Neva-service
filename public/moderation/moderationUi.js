export function formatDateForInput(dateString) {
    if (!dateString) return '';
	const date = new Date(dateString);
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60000);
	return localDate.toISOString().split('T')[0];
}

export function getLocalDate() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function createReviewItem(review, options) {
	const {
		sourcesList,
		typesList,
		marksList,
		malfunctionsList,
		onUpdate,
		onDelete,
	} = options;
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
      <input id="${prefix}-name" class="review-item__input" type="text" name="name" placeholder="Иван Иванов" value="${
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
      <input id="${prefix}-malfunction-type" class="review-item__input" type="text" name="malfunction_type" placeholder="Сломался холодильник" value="${
		review.Malfunction_type || ''
	}" />
    </div>
    <div class="review-item__row">
      <label for="${prefix}-master" class="review-item__label">Мастер:</label>
      <input id="${prefix}-master" class="review-item__input" type="text" name="master" placeholder="Иван Иванов" value="${
		review.Master || ''
	}" />
    </div>

    <div class="review-item__row">
      <label for="${prefix}-source" class="review-item__label">Источник:</label>
      <select id="${prefix}-source" name="source"></select>
    </div>
    <div class="review-item__row">
      <label for="${prefix}-type" class="review-item__label">Тип техники:</label>
      <select id="${prefix}-type" name="type"></select>
    </div>
    <div class="review-item__row">
      <label for="${prefix}-mark" class="review-item__label">Марка:</label>
      <select id="${prefix}-mark" name="mark"></select>
    </div>
    <div class="review-item__row">
      <label for="${prefix}-malfunctions" class="review-item__label">Неисправности:</label>
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
      <textarea id="${prefix}-review" class="review-item__textarea" name="review" placeholder="Быстро и качественно" required>${
		review.Review
	}</textarea>
    </div>
    <div class="review-item__row">
      <label for="${prefix}-comment" class="review-item__label">Комментарий компании:</label>
      <textarea id="${prefix}-comment" class="review-item__textarea" name="comment" placeholder="Спасибо за отзыв!">${
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
			placeholder: 'Посудомоечные машины',
			render: {
				no_results: function (data, escape) {
					return `<div class="no-results">Ничего не найдено</div>`;
				},
			},
			onChange: function (value) {
				this.input.value = value;
			},
		}
	);
	if (review.Source) {
		sourceSelect.setValue(review.Source, true);
	}

	const typeSelect = new TomSelect(details.querySelector(`#${prefix}-type`), {
		valueField: 'Name',
		labelField: 'Name',
		searchField: 'Name',
		options: typesList,
		maxItems: 1,
		create: false,
		placeholder: 'Телевизор',
		render: {
			no_results: function (data, escape) {
				return `<div class="no-results">Ничего не найдено</div>`;
			},
		},
	});
	if (review.Type) {
		typeSelect.setValue(review.Type, true);

	}

	const markSelect = new TomSelect(details.querySelector(`#${prefix}-mark`), {
		valueField: 'Name',
		labelField: 'Name',
		searchField: 'Name',
		options: marksList,
		maxItems: 1,
		create: false,
		placeholder: 'LG',
		render: {
			no_results: function (data, escape) {
				return `<div class="no-results">Ничего не найдено</div>`;
			},
		},
	});
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
			placeholder: 'Подключение стиральной машины',
			render: {
				no_results: function (data, escape) {
					return `<div class="no-results">Ничего не найдено</div>`;
				},
			},
		}
	);
	if (review.Malfunctions) {
		const selectedIDs = review.Malfunctions.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		malfunctionsSelect.setValue(selectedIDs, true);
	}

	const toggleButton = header.querySelector('.review-item__toggle-button');
	toggleButton.addEventListener('click', () => {
		if (!details.classList.contains('review-item__details--open')) {
			details.classList.add('review-item__details--open');
			toggleButton.classList.add('review-item__toggle-button--open');
			const commentDateInput = details.querySelector(
				`[name='comment_date']`
			);
			if (!commentDateInput.value) {
                commentDateInput.value = getLocalDate();
			}
		} else {
			details.classList.remove('review-item__details--open');
			toggleButton.classList.remove('review-item__toggle-button--open');
		}
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		if (!confirm('Вы собираетесь изменить отзыв. Продолжить?')) return;
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
			source: sourceSelect.getValue(),
			type: typeSelect.getValue(),
			mark: markSelect.getValue(),
			malfunctions: malfunctionsSelect.getValue().join(','),
		};
		if (typeof onUpdate === 'function') {
			onUpdate(dataToSend, container);
		}
	});

	form.querySelector('.review-item__button--delete').addEventListener(
		'click',
		() => {
			if (!confirm('Вы собираетесь удалить отзыв. Продолжить?')) return;
			const id = form.querySelector("input[name='id']").value;
			if (typeof onDelete === 'function') {
				onDelete(id, container);
			}
		}
	);

	return container;
}

export function updateReviewItemUI(container, review) {
    const header = container.querySelector('.review-item__header');
    header.querySelector('.review-item__id').textContent = review.id;
    header.querySelector('.review-item__date').textContent = formatDateForInput(review.Send_date);
    header.querySelector('.review-item__author').textContent = review.Name;
    header.querySelector('.review-item__rating').textContent = `${review.Rate} из 5`;
    header.querySelector('.review-item__text').textContent = review.Review;
}
