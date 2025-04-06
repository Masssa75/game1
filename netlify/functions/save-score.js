// netlify/functions/save-score.js (Updated to save wallet_address)
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*', // Use environment variable or wildcard
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // 1. Check Authentication (Netlify Identity)
  const { user } = context.clientContext;
  if (!user) {
    // User context might be missing if function is called without token or identity isn't set up
    // console.log("Save score function invoked - User not found in context."); // Optional server log
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'You must be logged in to save scores.' }) };
  }

  // 2. Get Supabase Credentials from Environment Variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use SERVICE key for backend inserts
  if (!supabaseUrl || !supabaseKey) {
       console.error('Supabase environment variables (URL or Service Key) are missing.');
       return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  // 3. Initialize Supabase Client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 4. Parse Request Body (Score and Wallet Address)
  let scoreData;
  try {
    scoreData = JSON.parse(event.body);
    // Validate required fields from the body
    if (typeof scoreData.score !== 'number') {
        throw new Error('Invalid score data type provided.');
    }
    // *** ADD VALIDATION FOR wallet_address ***
    // Basic check: Ensure it's a non-empty string (more robust checks like regex could be added if needed)
    if (typeof scoreData.wallet_address !== 'string' || !scoreData.wallet_address.trim()) {
         throw new Error('Invalid or missing wallet_address provided.');
    }
    // *****************************************
  } catch (error) {
    console.error('Error parsing request body:', error.message);
    // Provide the specific parsing error back to the client if possible
    return { statusCode: 400, headers, body: JSON.stringify({ error: `Bad request: ${error.message}` }) };
  }

  // 5. Prepare Data for Insertion (including wallet_address)
  // *** ADD wallet_address TO THE INSERT DATA OBJECT ***
  const dataToInsert = {
    user_id: user.sub,                  // Netlify user ID
    score: scoreData.score,             // Score from request body
    user_email: user.email,             // Email from Netlify user context
    wallet_address: scoreData.wallet_address.trim() // Wallet address from request body (trimmed)
  };
  // ************************************************

  // 6. Insert Data into Supabase
  try {
    const { data, error } = await supabase
      .from('scores')           // Target the 'scores' table
      .insert([dataToInsert])   // Insert the prepared data object
      .select();                // Optionally return the inserted row(s)

    // Handle potential Supabase errors during insert
    if (error) {
      console.error('Supabase insert error:', error);
      // Check for specific Supabase error codes if needed (e.g., unique constraint violation)
      throw error; // Re-throw to be caught by the outer catch block
    }

    // 7. Return Success Response
    return {
      statusCode: 200, // OK
      headers,
      body: JSON.stringify({ message: 'Score saved successfully!', savedData: data }),
    };

  } catch (error) {
    // Catch errors from the insert operation or re-thrown errors
    console.error('Error saving score to Supabase:', error.message);
    return {
      statusCode: 500, // Internal Server Error
      headers,
      body: JSON.stringify({ error: 'Failed to save score.', details: error.message || 'Unknown Supabase error' }),
    };
  }
};