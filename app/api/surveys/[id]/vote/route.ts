import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`Voting on survey with id: ${id}`);

  try {
    const { optionId } = await request.json();
    const userToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!userToken) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 403 });
    }

    const decodedToken = jwt.verify(userToken, process.env.SECRET_KEY as string) as { id: number };
    const userId = decodedToken.id;

    const voteResult = await pool.query(
      'INSERT INTO votes (survey_id, option_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [id, optionId, userId]
    );

    return NextResponse.json(voteResult.rows[0], { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("Oy verme hatası:", err.message);
    console.error("Stack Trace:", err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
