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

app.post('/submitReview', (req, res) => {
	let { name, repair_date, malfunction_type, master, review, rate } =
		req.body;

	repair_date = repair_date || null;
	malfunction_type = malfunction_type || null;
	master = master || null;

	const query = `
    INSERT INTO Reviews 
      (Name, Repair_date, Malfunction_type, Master, Review, Rate, Published, Send_date)
    VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_DATE())
  `;

	db.query(
		query,
		[name, repair_date, malfunction_type, master, review, rate],
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ success: false });
			}
			res.json({ success: true });
		}
	);
});

app.get('/getReviews', (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = 20;
	const offset = (page - 1) * limit;
	const query = `SELECT SQL_CALC_FOUND_ROWS * FROM Reviews ORDER BY Send_date DESC LIMIT ? OFFSET ?`;
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
	} = req.body;

	send_date = send_date || null;
	repair_date = repair_date || null;
	malfunction_type = malfunction_type || null;
	master = master || null;
	comment = comment || null;
	comment_date = comment_date || null;

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
      Comment_date = ?
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
			id,
		],
		(err, result) => {
			if (err) {
				console.error(err);
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
	db.query(query, [id], (err, result) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false });
		}
		res.json({ success: true });
	});
});

app.listen(3000, () => {
	console.log('Сервер запущен на http://localhost:3000');
});
