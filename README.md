# 📚 School Management API

A Node.js + Express + MySQL API for adding and listing schools by proximity.

---

## 🚀 Features
- **Add School** – Insert new school data.
- **List Schools** – Sorted by distance from given coordinates.
- **MySQL (SkySQL)** – Auto-creates DB and table on startup.
- **Hosted on Render** – [Live API](https://school-api-backend-k3vf.onrender.com)

---

## ⚙️ Setup

1. **Clone & Install**
```bash
git clone <repo-url>
cd <project>
npm install
```

2. **.env file**
```env
DB_HOST=your-host
DB_USER=your-user
DB_PASS=your-pass
DB_NAME=your-db
DB_PORT=4078
PORT=3000
```

3. **Run**
```bash
node app.js
```

---

## 🔌 Endpoints

### **POST** `/addSchool`
```json
{
  "name": "St. Xavier's School",
  "address": "12 Main Road, Kochi",
  "latitude": 9.9312,
  "longitude": 76.2673
}
```

### **GET** `/listSchools?latitude=9.9312&longitude=76.2673`

---

## 🧪 Testing
Import the Postman collection: `dbdummydata.json`

---
