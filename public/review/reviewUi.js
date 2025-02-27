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

export function renderStars(rate) {
	let html = '';
	for (let i = 1; i <= 5; i++) {
		html +=
			i <= rate
				? '<span class="review-card__star review-card__star--filled"></span>'
				: '<span class="review-card__star review-card__star--empty"></span>';
	}
	return html;
}

export function renderReviewCard(review) {
	const article = document.createElement('article');
	article.className = 'review-card';
	article.setAttribute('itemprop', 'review');
	article.setAttribute('itemscope', '');
	article.setAttribute('itemtype', 'https://schema.org/Review');

	const header = document.createElement('header');
	header.className = 'review-card__header';
	header.innerHTML = `
    <span class="review-card__author" itemprop="author" itemscope itemtype="https://schema.org/Person">
      <span itemprop="name">${review.Name}</span>
    </span>
    /
    <time class="review-card__date" itemprop="datePublished" datetime="${
		review.Send_date || ''
	}">
      ${formatDateForInput(review.Send_date)}
    </time>
  `;
	article.appendChild(header);

	const body = document.createElement('div');
	body.className = 'review-card__body';
	body.setAttribute('itemprop', 'reviewBody');
	body.innerHTML = review.Review || '';
	article.appendChild(body);

	const meta = document.createElement('div');
	meta.className = 'review-card__meta';

	if (review.Master) {
		const masterDiv = document.createElement('div');
		masterDiv.className = 'review-card__master';
		masterDiv.innerHTML = `Мастер: <span>${review.Master}</span>`;
		meta.appendChild(masterDiv);
	}

	if (review.Malfunction_type) {
		const malfunctionDiv = document.createElement('div');
		malfunctionDiv.className = 'review-card__malfunction';
		malfunctionDiv.innerHTML = `Неисправность: <span>${review.Malfunction_type}</span>`;
		meta.appendChild(malfunctionDiv);
	}

	if (meta.childElementCount > 0) {
		article.appendChild(meta);
	}

	const rateDiv = document.createElement('div');
	rateDiv.className = 'review-card__rate';
	rateDiv.setAttribute('itemprop', 'reviewRating');
	rateDiv.setAttribute('itemscope', '');
	rateDiv.setAttribute('itemtype', 'https://schema.org/Rating');
	rateDiv.innerHTML = `
    <meta itemprop="worstRating" content="1" />
    <meta itemprop="bestRating" content="5" />
    <strong>Оценка:</strong> <span itemprop="ratingValue">${
		review.Rate
	}</span> из 5
    <div class="review-card__stars">
      ${renderStars(review.Rate)}
    </div>
  `;
	article.appendChild(rateDiv);

	if (review.Comment) {
		const answer = document.createElement('div');
		answer.className = 'review-card__answer';
		answer.innerHTML = `
      <header class="review-card__answer-header">
        <span class="review-card__answer-author">Нева-Сервис</span>
        <time class="review-card__answer-date" datetime="${
			review.Comment_date || ''
		}">
          ${formatDateForInput(review.Comment_date)}
        </time>
      </header>
      <div class="review-card__answer-text">${review.Comment}</div>
    `;
		article.appendChild(answer);
	}
	return article;
}
