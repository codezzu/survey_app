import { supabase } from './supebaseClient';

export async function getSurveys() {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      id,
      title,
      created_at,
      options:survey_options (
        id,
        option_text,
        votes
      )
    `);

  if (error) {
    console.error('Error fetching surveys:', error);
    return [];
  }

  return data;
}
