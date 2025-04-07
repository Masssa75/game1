// netlify/functions/save-score.js (REMOVED Netlify Auth, saves wallet_address)
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Keep Authorization header allowed just in case needed later, though not used now
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Ensure it's a POST request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed: Please use POST' };
  }

  // --- Netlify Identity Authentication REMOVED ---
  // const { user } = context.clientContext;
  // if (!user) { ... } // Removed check

  // 1. Get Supabase Credentials
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Still use SERVICE key for inserts
  if (!supabaseUrl || !supabaseKey) {
       console.error('Supabase environment variables (URL or Service Key) are missing.');
       return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  // 2. Initialize Supabase Client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 3. Parse Request Body (Score and Wallet Address are now required)
  let scoreData;
  try {
    scoreData = JSON.parse(event.body);
    // Validate required fields from the body
    if (typeof scoreData.score !== 'number') {
        throw new Error('Invalid score data type provided.');
    }
    if (typeof scoreData.wallet_address !== 'string' || !scoreData.wallet_address.trim()) {
         throw new Error('Invalid or missing wallet_address provided.');
    }
  } catch (error) {
    console.error('Error parsing request body:', error.message);
    return { statusCode: 400, headers, body: JSON.stringify({ error: `Bad request: ${error.message}` }) };
  }

  // 4. Prepare Data for Insertion (ONLY score and wallet_address)
  const dataToInsert = {
    // user_id: user.sub, // Removed
    score: scoreData.score,
    // user_email: user.email, // Removed
    wallet_address: scoreData.wallet_address.trim() // Keep wallet address
  };
  // Note: user_id and user_email columns in Supabase will now receive NULL unless you set defaults or remove the columns.

  // 5. Insert Data into Supabase
  try {
    const { data, error } = await supabase
      .from('scores')
      .insert([dataToInsert])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      // Handle specific errors like constraint violations if needed
      // e.g., if wallet_address + score needed to be unique per user/period
      throw error;
    }

    // 6. Return Success Response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Score saved successfully!', savedData: data }),
    };

  } catch (error) {
    console.error('Error saving score to Supabase:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save score.', details: error.message || 'Unknown Supabase error' }),
    };
  }
};