// index.js
require('dotenv').config();
const express = require('express');
const pool = require('./db');
const { addSchoolSchema, listSchoolsSchema } = require('./validators');

const app = express();
app.use(express.json());

// Helper: compute haversine distance (km)
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2)
          + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
          * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// POST /addSchool
app.post('/addSchool', async (req, res) => {
  const { error, value } = addSchoolSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details.map(d=>d.message) });

  const { name, address, latitude, longitude } = value;
  try {
    const [result] = await pool.execute(
      `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`,
      [name, address, latitude, longitude]
    );
    const insertedId = result.insertId;
    res.status(201).json({ success: true, id: insertedId, message: 'School added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// GET /listSchools?latitude=..&longitude=..
app.get('/listSchools', async (req, res) => {
  const query = { latitude: parseFloat(req.query.latitude), longitude: parseFloat(req.query.longitude) };
  const { error } = listSchoolsSchema.validate(query);
  if (error) return res.status(400).json({ success: false, error: error.details.map(d=>d.message) });

  const userLat = query.latitude;
  const userLon = query.longitude;

  try {
    const [rows] = await pool.execute(`SELECT id, name, address, latitude, longitude, created_at FROM schools`);
    // compute distance for each and sort
    const withDistance = rows.map(r => {
      const distKm = haversineDistanceKm(userLat, userLon, parseFloat(r.latitude), parseFloat(r.longitude));
      return { ...r, distance_km: Number(distKm.toFixed(4)) };
    });

    withDistance.sort((a,b) => a.distance_km - b.distance_km);

    res.json({ success: true, count: withDistance.length, schools: withDistance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));