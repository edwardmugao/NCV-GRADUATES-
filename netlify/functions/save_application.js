// netlify/functions/save_application.js

const { Client } = require('pg');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    const client = new Client({
      host: process.env.PG_HOST,      // e.g., "ncv-graduates-db.xxxxx.postgres.database.azure.com"
      user: process.env.PG_USER,      // your DB username
      password: process.env.PG_PASSWORD, // your DB password
      database: process.env.PG_DATABASE, // your database name
      port: process.env.PG_PORT || 5432,
      ssl: { rejectUnauthorized: false } // for most cloud DBs
    });

    await client.connect();

    const query = `
      INSERT INTO applications
      (name, email, phone, ncv_id, gender, marital_status, disability, graduation_year, school, employment, business, description, amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id
    `;

    const values = [
      data.name,
      data.email,
      data.phone,
      data.ncv_id,
      data.gender,
      data.marital_status,
      data.disability,
      data.graduation_year,
      data.school,
      data.employment,
      data.business,
      data.description,
      data.amount
    ];

    const result = await client.query(query, values);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success', id: result.rows[0].id }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: err.message }),
    };
  }
};
