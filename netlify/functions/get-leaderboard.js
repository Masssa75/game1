// netlify/functions/get-leaderboard.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS headers - Allow GET requests from your site
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allow GET
  };

  // Respond to CORS preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow GET requests for fetching leaderboard
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method Not Allowed: Please use GET' };
  }

  // Get Supabase credentials (using the public anon key for reads)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Use the ANON key

  if (!supabaseUrl || !supabaseAnonKey) {
       console.error('Supabase URL or Anon Key environment variable is missing.');
       return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  // Initialize Supabase client with anon key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Fetch top 10 score entries (email and score), ordered by score descending
    console.log("Fetching leaderboard data from Supabase...");
    const { data, error } = await supabase
      .from('scores')
      .select('user_email, score') // Select only needed columns
      .order('score', { ascending: false }) // Order highest score first
      .limit(10); // Get top 10 entries

    if (error) {
      console.error('Supabase select error:', error);
      throw error; // Let the outer catch handle it
    }

    console.log("Leaderboard data fetched successfully:", data);
    // Return the leaderboard data
    return {
      statusCode: 200, // OK
      headers,
      body: JSON.stringify(data), // Send the array of scores directly
    };

  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    return {
      statusCode: 500, // Internal Server Error
      headers,
      body: JSON.stringify({ error: 'Failed to fetch leaderboard.', details: error.message || error }),
    };
  }
};