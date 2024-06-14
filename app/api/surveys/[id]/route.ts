import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`Fetching survey with id: ${id}`);
  try {
    const surveyResult = await pool.query(`
      SELECT s.id, s.title, s.created_at, json_agg(json_build_object('id', so.id, 'option_text', so.option_text, 'votes', coalesce(v.votes, 0))) as options
      FROM surveys s
      JOIN survey_options so ON s.id = so.survey_id
      LEFT JOIN (
        SELECT option_id, COUNT(*) as votes
        FROM votes
        GROUP BY option_id
      ) v ON so.id = v.option_id
      WHERE s.id = 1
      GROUP BY s.id
    `, [id]);

    if (surveyResult.rowCount === 0) {
      console.log(`Survey with id ${id} not found`);
      return NextResponse.json({ error: 'Anket bulunamadı' }, { status: 404 });
    }

    const survey = surveyResult.rows[0];
    console.log(`Survey fetched successfully: ${JSON.stringify(survey)}`);
    return NextResponse.json(survey, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("Anket detay hatası:", err.message);
    console.error("Stack Trace:", err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
