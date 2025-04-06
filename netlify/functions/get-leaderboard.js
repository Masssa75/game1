// netlify/functions/get-leaderboard.js (Cleaned Logs)
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method Not Allowed: Please use GET' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
       console.error('Supabase URL or Anon Key environment variable is missing.');
       return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // console.log("Fetching leaderboard data from Supabase..."); // Removed log
    const { data, error } = await supabase
      .from('scores')
      .select('user_email, score')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase select error:', error);
      throw error;
    }
    // console.log("Leaderboard data fetched successfully:", data); // Removed log

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch leaderboard.', details: error.message || error }),
    };
  }
};