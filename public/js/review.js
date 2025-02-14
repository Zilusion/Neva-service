document.addEventListener('DOMContentLoaded', function () {
	const reviewForm = document.getElementById('review-form');
	const submitButton = reviewForm.querySelector('button[type="submit"]');

	const nameInput = document.getElementById('name');
	const reviewTextArea = document.getElementById('review');
	const rateRadios = document.getElementsByName('rate');

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

		const name = document.getElementById('name').value;
		const repairDate = document.getElementById('repair-date').value;
		const malfunctionType =
			document.getElementById('malfunction-type').value;
		const master = document.getElementById('master').value;
		const reviewText = document.getElementById('review').value;
		let rate = '';
		const rateRadios = document.getElementsByName('rate');
		rateRadios.forEach((radio) => {
			if (radio.checked) {
				rate = radio.value;
			}
		});

		const data = {
			name,
			repair_date: repairDate,
			malfunction_type: malfunctionType,
			master,
			review: reviewText,
			rate,
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
				} else {
					alert('Произошла ошибка при отправке отзыва.');
				}
			})
			.catch((err) => {
				console.error('Ошибка:', err);
			});
	});
});
