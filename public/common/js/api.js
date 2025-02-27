// moderation
export async function getModerationConfig() {
	const res = await fetch('/getModerationConfig');
	return await res.json();
}

export async function getReviews(page) {
	const res = await fetch(`/getReviews?page=${page}`);
	return await res.json();
}

export async function getReviewById(id) {
	const res = await fetch(`/getReviewById?id=${id}`);
	return await res.json();
}


export async function updateReview(data) {
	const res = await fetch('/updateReview', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return await res.json();
}

export async function deleteReview(id) {
	const res = await fetch('/deleteReview', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id }),
	});
	return await res.json();
}

export async function getSources() {
	const res = await fetch('/getSources');
	return await res.json();
}

export async function getTypes() {
	const res = await fetch('/getTypes');
	return await res.json();
}

export async function getMarks() {
	const res = await fetch('/getMarks');
	return await res.json();
}

export async function getMalfunctions() {
	const res = await fetch('/getMalfunctions');
	return await res.json();
}


// review
export async function getReviewsConfig() {
	const res = await fetch('/getReviewsConfig');
	return await res.json();
}

export async function submitReview(data) {
	const res = await fetch('/submitReview', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return await res.json();
}

export async function getPublicReviews(source, page) {
	const res = await fetch(`/getPublicReviews?source=${source}&page=${page}`);
	return await res.json();
}

