const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '123456789',
	database: 'neva_service_new',
});

db.connect((err) => {
	if (err) {
		console.error('Ошибка подключения к БД:', err);
		process.exit(1);
	}
	console.log('Подключено к базе данных.');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const MODERATION_LIMIT = 10;
const PUBLIC_LIMIT = 2;

app.post('/submitReview', (req, res) => {
	let { name, repair_date, malfunction_type, master, review, rate, source } =
		req.body;

	repair_date = repair_date || null;
	malfunction_type = malfunction_type || null;
	master = master || null;
	source = source || 0;

	const query = `
    INSERT INTO Reviews 
      (Name, Repair_date, Malfunction_type, Master, Review, Rate, Published, Send_date, Source)
    VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_DATE(), ?)
  `;

	db.query(
		query,
		[name, repair_date, malfunction_type, master, review, rate, source],
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ success: false });
			}
			res.json({ success: true });
		}
	);
});

app.get('/getPublicReviews', (req, res) => {
	const source = parseInt(req.query.source) || 0; // 1,2,3
	const page = parseInt(req.query.page) || 1;
	const limit = PUBLIC_LIMIT;
	const offset = (page - 1) * limit;

	// Основной запрос отзывов
	const query = `
      SELECT SQL_CALC_FOUND_ROWS *
      FROM Reviews
      WHERE Published = 1 AND Source = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
	db.query(query, [source, limit, offset], (err, reviews) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		// Всего записей
		db.query('SELECT FOUND_ROWS() as total', (err2, results) => {
			if (err2) {
				console.error(err2);
				return res.status(500).json({ success: false });
			}
			const total = results[0].total;

			// Запрос для распределения оценок (1..5)
			const ratingDistQuery = `
              SELECT Rate, COUNT(*) as count
              FROM Reviews
              WHERE Published = 1 AND Source = ?
              GROUP BY Rate
            `;
			db.query(ratingDistQuery, [source], (err3, ratingDistRows) => {
				if (err3) {
					console.error(err3);
					return res.status(500).json({ success: false });
				}

				// Запрос для среднего рейтинга и общего числа
				const avgQuery = `
                  SELECT AVG(Rate) as avgRating, COUNT(*) as totalReviews
                  FROM Reviews
                  WHERE Published = 1 AND Source = ?
                `;
				db.query(avgQuery, [source], (err4, avgRows) => {
					if (err4) {
						console.error(err4);
						return res.status(500).json({ success: false });
					}

					const avgRating = avgRows[0].avgRating || 0;
					const totalReviews = avgRows[0].totalReviews || 0;

					// Преобразуем распределение в удобный формат (Rate -> count)
					// Пример: [{Rate:5, count:10}, {Rate:4, count:3}, ...]
					// Вы можете вернуть как есть
					const ratingDistribution = {};
					for (let i = 1; i <= 5; i++) {
						ratingDistribution[i] = 0; // по умолчанию 0
					}
					ratingDistRows.forEach((row) => {
						ratingDistribution[row.Rate] = row.count;
					});

					res.json({
						success: true,
						reviews,
						total, // количество отзывов на текущем срезе
						avgRating, // средняя оценка
						totalReviews, // общее число опубликованных отзывов
						ratingDistribution, // {1: X, 2: Y, ... 5: Z}
					});
				});
			});
		});
	});
});

app.get('/getReviews', (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = MODERATION_LIMIT;
	const offset = (page - 1) * limit;
	const query = `SELECT SQL_CALC_FOUND_ROWS * FROM Reviews ORDER BY id DESC LIMIT ? OFFSET ?`;
	db.query(query, [limit, offset], (err, reviews) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}

		db.query('SELECT FOUND_ROWS() as total', (err2, results) => {
			if (err2) {
				console.error(err2);
				return res.status(500).json({ success: false });
			}
			const total = results[0].total;
			res.json({ reviews, total });
		});
	});
});

app.get('/getReviewById', (req, res) => {
	const id = parseInt(req.query.id);
	if (!id) {
		return res
			.status(400)
			.json({ success: false, message: 'No ID provided' });
	}
	const query = 'SELECT * FROM Reviews WHERE id = ?';
	db.query(query, [id], (err, rows) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		if (!rows.length) {
			return res.json({ success: false, message: 'Not found' });
		}
		res.json({ success: true, review: rows[0] });
	});
});

app.post('/updateReview', (req, res) => {
	let {
		id,
		send_date,
		published,
		name,
		repair_date,
		malfunction_type,
		master,
		review,
		rate,
		comment,
		comment_date,
		source,
		type,
		mark,
		malfunctions,
	} = req.body;

	send_date = send_date || null;
	repair_date = repair_date || null;
	malfunction_type = malfunction_type || null;
	master = master || null;
	comment = comment || null;
	comment_date = comment_date || null;
	source = source || 0;
	type = type || null;
	mark = mark || null;
	malfunctions = malfunctions || null;

	const updateQuery = `
    UPDATE Reviews
    SET
      Send_date = ?,
      Published = ?,
      Name = ?,
      Repair_date = ?,
      Malfunction_type = ?,
      Master = ?,
      Review = ?,
      Rate = ?,
      Comment = ?,
      Comment_date = ?,
	  Source = ?,
	  Type = ?,
	  Mark = ?,
	  Malfunctions = ?
    WHERE id = ?
  `;

	db.query(
		updateQuery,
		[
			send_date,
			published,
			name,
			repair_date,
			malfunction_type,
			master,
			review,
			rate,
			comment,
			comment_date,
			source,
			type,
			mark,
			malfunctions,
			id,
		],
		(err, result) => {
			if (err) {
				console.error('Ошибка updateReview:', err);
				return res.status(500).json({ success: false });
			}
			if (result.affectedRows === 0) {
				return res.json({ success: false });
			}

			const selectQuery = 'SELECT * FROM Reviews WHERE id = ?';
			db.query(selectQuery, [id], (err2, rows) => {
				if (err2 || !rows.length) {
					console.error('Ошибка выборки:', err2);
					return res.status(500).json({ success: false });
				}
				res.json({ success: true, updatedReview: rows[0] });
			});
		}
	);
});

app.post('/deleteReview', (req, res) => {
	const { id } = req.body;
	const query = `DELETE FROM Reviews WHERE id = ?`;
	db.query(query, [id], (err) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		res.json({ success: true });
	});
});

app.get('/getSources', (req, res) => {
	const query = 'SELECT id, Name FROM Sources ORDER BY Name ASC';
	db.query(query, (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		res.json({ success: true, sources: results });
	});
});

app.get('/getTypes', (req, res) => {
	const query = 'SELECT Code, Name FROM Types ORDER BY Name ASC';
	db.query(query, (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		res.json({ success: true, types: results });
	});
});

app.get('/getMarks', (req, res) => {
	const query = 'SELECT Name FROM Marks ORDER BY Name ASC';
	db.query(query, (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		res.json({ success: true, marks: results });
	});
});

app.get('/getMalfunctions', (req, res) => {
	const query = 'SELECT id, Name FROM Malfunctions ORDER BY Name ASC';
	db.query(query, (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		res.json({ success: true, malfunctions: results });
	});
});

app.get('/getModerationConfig', (req, res) => {
	res.json({
		success: true,
		limit: MODERATION_LIMIT,
	});
});

app.get('/getReviewsConfig', (req, res) => {
	res.json({
		success: true,
		limit: PUBLIC_LIMIT,
	});
});

app.listen(3000, () => {
	console.log('Сервер запущен на http://localhost:3000');
});
