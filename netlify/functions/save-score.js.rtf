{\rtf1\ansi\ansicpg1252\cocoartf2818
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // netlify/functions/save-score.js\
const \{ createClient \} = require('@supabase/supabase-js');\
\
exports.handler = async (event, context) => \{\
  // Set up CORS headers - Allow requests from your Netlify site URL\
  const headers = \{\
    'Access-Control-Allow-Origin': process.env.URL || '*', // Use your site URL or '*' for testing\
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',\
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS\
  \};\
\
  // Respond to CORS preflight OPTIONS requests\
  if (event.httpMethod === 'OPTIONS') \{\
    return \{\
      statusCode: 204, // No Content\
      headers,\
      body: '',\
    \};\
  \}\
\
  // Only allow POST requests for saving scores\
  if (event.httpMethod !== 'POST') \{\
    return \{\
      statusCode: 405, // Method Not Allowed\
      headers,\
      body: 'Method Not Allowed: Please use POST',\
    \};\
  \}\
\
  // 1. Check Authentication (user must be logged in)\
  const \{ user \} = context.clientContext;\
  if (!user) \{\
    return \{\
      statusCode: 401, // Unauthorized\
      headers,\
      body: JSON.stringify(\{ error: 'You must be logged in to save scores.' \}),\
    \};\
  \}\
\
  // 2. Get Supabase credentials from environment variables\
  const supabaseUrl = process.env.SUPABASE_URL;\
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;\
\
  if (!supabaseUrl || !supabaseKey) \{\
       console.error('Supabase URL or Service Key environment variable is missing.');\
       return \{ statusCode: 500, headers, body: JSON.stringify(\{ error: 'Server configuration error.' \}) \};\
  \}\
\
  // 3. Initialize Supabase client\
  const supabase = createClient(supabaseUrl, supabaseKey);\
\
  // 4. Parse the score from the request body\
  let scoreData;\
  try \{\
    scoreData = JSON.parse(event.body);\
    if (typeof scoreData.score !== 'number') \{\
      throw new Error('Invalid score data type.');\
    \}\
  \} catch (error) \{\
    console.error('Error parsing request body:', error);\
    return \{\
      statusCode: 400, // Bad Request\
      headers,\
      body: JSON.stringify(\{ error: 'Bad request: Could not parse score data.' \}),\
    \};\
  \}\
\
  // 5. Prepare data for Supabase\
  const dataToInsert = \{\
    user_id: user.sub, // Use the unique subject ID from Netlify Identity/JWT\
    score: scoreData.score,\
    // Supabase automatically adds 'created_at' if column exists\
  \};\
\
  // 6. Insert data into the 'scores' table\
  try \{\
    const \{ data, error \} = await supabase\
      .from('scores')\
      .insert([dataToInsert])\
      .select(); // .select() returns the inserted row(s)\
\
    if (error) \{\
      console.error('Supabase insert error:', error);\
      throw error; // Throw error to be caught by outer try...catch\
    \}\
\
    console.log('Score saved successfully:', data);\
    // 7. Return success response\
    return \{\
      statusCode: 200, // OK\
      headers,\
      body: JSON.stringify(\{ message: 'Score saved successfully!', savedData: data \}),\
    \};\
\
  \} catch (error) \{\
    console.error('Error saving score:', error.message);\
    return \{\
      statusCode: 500, // Internal Server Error\
      headers,\
      body: JSON.stringify(\{ error: 'Failed to save score.', details: error.message \}),\
    \};\
  \}\
\};}