import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { optionId } = await request.json();
    const userToken = request.headers.get('authorization')?.split(' ')[1];

    if (!userToken) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 403 });
    }

    const decodedToken = jwt.verify(userToken, process.env.SECRET_KEY);
    const userId = (decodedToken as { id: number }).id;

    const voteResult = await pool.query(
      'INSERT INTO votes (survey_id, option_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [id, optionId, userId]
    );

    if (voteResult.rowCount === 0) {
      return NextResponse.json({ error: 'Oy kullanılamadı' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Oy başarıyla kullanıldı' }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("Oy kullanma hatası:", err.message);
    console.error("Stack Trace:", err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
