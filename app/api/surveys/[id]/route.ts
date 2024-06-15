import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`Fetching survey with id: ${id}`);
  
  try {
    const surveyResult = await sql`
      SELECT s.id, s.title, s.created_at, 
             json_agg(json_build_object('id', so.id, 'option_text', so.option_text, 'votes', coalesce(v.votes, 0))) as options
      FROM surveys s
      JOIN survey_options so ON s.id = so.survey_id
      LEFT JOIN (
        SELECT option_id, COUNT(*) as votes
        FROM votes
        GROUP BY option_id
      ) v ON so.id = v.option_id
      WHERE s.id = ${id}
      GROUP BY s.id
    `;

    if (surveyResult.rowCount === 0) {
      console.log(`Survey with id ${id} not found`);
      return NextResponse.json({ error: 'Anket bulunamadı' }, { status: 404 });
    }

    const survey = surveyResult;
    console.log(`Survey fetched successfully: ${JSON.stringify(survey)}`);
    return NextResponse.json(survey, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("Anket detay hatası:", err.message);
    console.error("Stack Trace:", err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
