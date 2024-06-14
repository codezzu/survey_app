import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
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
    return NextResponse.json(survey.rows[0]);
  } catch (error: any) {
    console.error("Anket detay hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
