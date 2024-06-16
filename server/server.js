const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyAdminToken = require('./middleware'); // Middleware'i dahil edin
const verifyToken = require('./verifyToken');

require('dotenv').config(); // Environment variables'ı yükle

// Environment variables
const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const app = express();
app.use(bodyParser.json());

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    const token = jwt.sign({ id: newUser.rows[0].id }, SECRET_KEY, {
      expiresIn: '1h',
    });
    res.status(201).json({ token });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Geçersiz şifre' });
    }

    const token = jwt.sign({ id: user.rows[0].id }, SECRET_KEY, {
      expiresIn: '1h',
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Login route
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_admin = true',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Admin kullanıcı bulunamadı' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Geçersiz şifre' });
    }

    const token = jwt.sign({ id: user.rows[0].id, isAdmin: true }, SECRET_KEY, {
      expiresIn: '1h',
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Anket Oluşturma route
app.post('/admin/surveys', verifyAdminToken, async (req, res) => {
  const { title, options } = req.body;

  try {
    const newSurvey = await pool.query(
      'INSERT INTO surveys (title) VALUES ($1) RETURNING *',
      [title]
    );
    
    const surveyId = newSurvey.rows[0].id;
    
    const optionQueries = options.map(option => {
      return pool.query(
        'INSERT INTO survey_options (survey_id, option_text) VALUES ($1, $2)',
        [surveyId, option]
      );
    });
    
    await Promise.all(optionQueries);

    res.status(201).json(newSurvey.rows[0]);
  } catch (error) {
    console.error("Anket oluşturma hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Anket Listeleme route

app.get('/surveys', async (req, res) => {
  try {
    const surveys = await pool.query(`
      SELECT s.id, s.title, s.created_at, json_agg(json_build_object('id', so.id, 'option_text', so.option_text, 'votes', coalesce(v.votes, 0))) as options
      FROM surveys s
      JOIN survey_options so ON s.id = so.survey_id
      LEFT JOIN (
        SELECT option_id, COUNT(*) as votes
        FROM votes
        GROUP BY option_id
      ) v ON so.id = v.option_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    res.status(200).json(surveys.rows);
  } catch (error) {
    console.error("Anket listeleme hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Anket Detay route
app.get('/surveys/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await pool.query(`
      SELECT s.id, s.title, s.created_at, json_agg(json_build_object('id', so.id, 'option_text', so.option_text, 'votes', coalesce(v.votes, 0))) as options
      FROM surveys s
      JOIN survey_options so ON s.id = so.survey_id
      LEFT JOIN (
        SELECT option_id, COUNT(*) as votes
        FROM votes
        GROUP BY option_id
      ) v ON so.id = v.option_id
      WHERE s.id = $1
      GROUP BY s.id
    `, [id]);
    res.status(200).json(survey.rows[0]);
  } catch (error) {
    console.error("Anket detay hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Tüm Anketleri Silme route
app.delete('/api/admin/surveys', verifyAdminToken, async (req, res) => {
  try {
    // Önce tüm anketlerin seçeneklerini silin
    await pool.query('DELETE FROM survey_options');

    // Sonra tüm anketleri silin
    await pool.query('DELETE FROM surveys');

    res.status(200).json({ message: 'Tüm anketler başarıyla silindi.' });
  } catch (error) {
    console.error("Tüm anketleri silme hatası:", error);
    res.status(500).json({ error: error.message });
  }
});


// Oy Verme route
app.post('/surveys/:id/vote', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;
  const userId = req.user.id;

  try {
    const vote = await pool.query(
      'INSERT INTO votes (survey_id, option_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [id, optionId, userId]
    );
    res.status(201).json(vote.rows[0]);
  } catch (error) {
    console.error("Oy verme hatası:", error);
    res.status(500).json({ error: error.message });
  }
});



// Admin Panel route
app.get('/admin/dashboard', verifyAdminToken, (req, res) => {
  res.json({ message: 'Admin paneline hoş geldiniz!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
