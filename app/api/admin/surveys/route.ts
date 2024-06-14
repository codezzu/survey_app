import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt, { JwtPayload } from 'jsonwebtoken';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { title, options } = await request.json();

    // Admin token doğrulama
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 403 });
    }

    let decoded: string | JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY || 'your_secret_key') as JwtPayload;
    } catch (err) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    if (!decoded || typeof decoded === 'string' || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Bu sayfaya erişim izniniz yok' }, { status: 403 });
    }

    const newSurvey = await pool.query(
      'INSERT INTO surveys (title) VALUES ($1) RETURNING *',
      [title]
    );

    const surveyId = newSurvey.rows[0].id;

    const optionQueries = options.map((option: string) => {
      return pool.query(
        'INSERT INTO survey_options (survey_id, option_text) VALUES ($1, $2)',
        [surveyId, option]
      );
    });

    await Promise.all(optionQueries);

    return NextResponse.json(newSurvey.rows[0], { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("Anket oluşturma hatası:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
