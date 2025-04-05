// netlify/functions/save-score.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Set up CORS headers - Allow requests from your Netlify site URL
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*', // Use your site URL or '*' for testing
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS
  };

  // Respond to CORS preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers,
      body: '',
    };
  }

  // Only allow POST requests for saving scores
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      headers,
      body: 'Method Not Allowed: Please use POST',
    };
  }

  // 1. Check Authentication (user must be logged in)
  const { user } = context.clientContext;
  if (!user) {
    // Adding a log here for clarity
    console.log("Function invoked but user not found in context.");
    return {
      statusCode: 401, // Unauthorized
      headers,
      body: JSON.stringify({ error: 'You must be logged in to save scores.' }),
    };
  }
  // Log user info if found
  console.log("Function invoked by user:", user.sub, "Email:", user.email);


  // 2. Get Supabase credentials from environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  // Adding logs to check environment variables
  console.log("Supabase URL:", supabaseUrl ? "Found" : "MISSING!");
  console.log("Supabase Key:", supabaseKey ? "Found" : "MISSING!");


  if (!supabaseUrl || !supabaseKey) {
       console.error('Supabase URL or Service Key environment variable is missing.');
       return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  // 3. Initialize Supabase client
  // Adding log before creating client
  console.log("Attempting to create Supabase client...");
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client created.");


  // 4. Parse the score from the request body
  let scoreData;
  try {
    // Adding log for received body
    console.log("Received event body:", event.body);
    scoreData = JSON.parse(event.body);
    if (typeof scoreData.score !== 'number') {
      throw new Error('Invalid score data type.');
    }
    // Log parsed score
    console.log("Parsed score:", scoreData.score);

  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400, // Bad Request
      headers,
      body: JSON.stringify({ error: 'Bad request: Could not parse score data.' }),
    };
  }

  // 5. Prepare data for Supabase
  const dataToInsert = {
    user_id: user.sub, // Use the unique subject ID from Netlify Identity/JWT
    score: scoreData.score,
  };
  console.log("Data prepared for insert:", dataToInsert);


  // 6. Insert data into the 'scores' table
  try {
    // Log before insert
    console.log("Attempting to insert into Supabase...");
    const { data, error } = await supabase
      .from('scores')
      .insert([dataToInsert])
      .select(); // .select() returns the inserted row(s)

    if (error) {
      console.error('Supabase insert error:', error);
      throw error; // Throw error to be caught by outer try...catch
    }

    console.log('Score saved successfully:', data);
    // 7. Return success response
    return {
      statusCode: 200, // OK
      headers,
      body: JSON.stringify({ message: 'Score saved successfully!', savedData: data }),
    };

  } catch (error) {
    console.error('Error saving score:', error.message);
    // Make sure error message is stringified in the response body
    return {
      statusCode: 500, // Internal Server Error
      headers,
      body: JSON.stringify({ error: 'Failed to save score.', details: error.message || error }),
    };
  }
};