// netlify/functions/save-score.js (Include user_email)
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  // OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  // Only POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed: Please use POST' };
  }

  // 1. Check Auth
  const { user } = context.clientContext;
  if (!user) {
    console.log("Function invoked but user not found in context.");
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'You must be logged in to save scores.' }) };
  }
  console.log("Function invoked by user:", user.sub, "Email:", user.email);

  // 2. Get Env Vars
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  console.log("Supabase URL:", supabaseUrl ? "Found" : "MISSING!");
  console.log("Supabase Key:", supabaseKey ? "Found" : "MISSING!");
  if (!supabaseUrl || !supabaseKey) {
       console.error('Supabase URL or Service Key environment variable is missing.');
       return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  // 3. Init Supabase
  console.log("Attempting to create Supabase client...");
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client created.");

  // 4. Parse Score
  let scoreData;
  try {
    console.log("Received event body:", event.body);
    scoreData = JSON.parse(event.body);
    if (typeof scoreData.score !== 'number') { throw new Error('Invalid score data type.'); }
    console.log("Parsed score:", scoreData.score);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad request: Could not parse score data.' }) };
  }

  // 5. Prepare data (NOW INCLUDES EMAIL)
  const dataToInsert = {
    user_id: user.sub,
    score: scoreData.score,
    user_email: user.email // ADDED EMAIL
  };
  console.log("Data prepared for insert:", dataToInsert);

  // 6. Insert data
  try {
    console.log("Attempting to insert into Supabase...");
    const { data, error } = await supabase
      .from('scores')
      .insert([dataToInsert])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    console.log('Score saved successfully:', data);

    // 7. Return success
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ message: 'Score saved successfully!', savedData: data }),
    };
  } catch (error) {
    console.error('Error saving score:', error.message);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: 'Failed to save score.', details: error.message || error }),
    };
  }
};