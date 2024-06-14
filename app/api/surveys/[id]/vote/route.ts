import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { optionId } = await req.json();

  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token gerekli' }, { status: 403 });
  }

  jwt.verify(token, SECRET_KEY, async (err: any, user: any) => {
    if (err) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const userId = user.id;

    try {
      const vote = await pool.query(
        'INSERT INTO votes (survey_id, option_id, user_id) VALUES ($1, $2, $3) RETURNING *',
        [id, optionId, userId]
      );
      return NextResponse.json(vote.rows[0]);
    } catch (error: any) {
      console.error("Oy verme hatası:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });
}
