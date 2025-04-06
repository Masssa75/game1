// netlify/functions/get-leaderboard.js (Updated to select wallet_address)
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers, body: '' }; }
  if (event.httpMethod !== 'GET') { return { statusCode: 405, headers, body: 'Method Not Allowed: Please use GET' }; }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Use ANON key for public reads
  if (!supabaseUrl || !supabaseAnonKey) {
       console.error('Supabase URL or Anon Key environment variable is missing.');
       return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Fetch top 10 scores, NOW including wallet_address
    const { data, error } = await supabase
      .from('scores')
      // *** SELECT user_email, score, AND wallet_address ***
      .select('user_email, score, wallet_address')
      // *************************************************
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase select error:', error);
      throw error;
    }

    // Return the leaderboard data (now includes wallet_address for each entry)
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