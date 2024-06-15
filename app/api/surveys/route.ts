import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Anket Listeleme route
export async function GET(request: NextRequest) {
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
    return NextResponse.json(surveys.rows, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("Anket listeleme hatası:", err.message);
    console.error("Stack Trace:", err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
