# FreshKart PH — Render + Aiven MySQL Deployment

This version uses one Node/Express `server.js` for both the React/Vite frontend and the backend API.
All records are loaded from Aiven MySQL through `/api/state` and the CRUD APIs.

## Fixed deployment issue

Render was using Node.js 24 by default, which can trigger the npm error:

```txt
npm error Exit handler never called!
```

This project now pins Node to `20.19.0` because Vite 7 requires Node `^20.19.0 || >=22.12.0`, while avoiding Node 24.

## Render settings

Use these settings in your Render Web Service:

```txt
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

## Environment variables

Add these in Render > Environment:

```txt
MYSQL_HOST=your-aiven-host.aivencloud.com
MYSQL_PORT=your-aiven-port
MYSQL_USER=avnadmin
MYSQL_PASSWORD=your-aiven-password
MYSQL_DATABASE=defaultdb
MYSQL_SSL=true
```

Render automatically provides `PORT`, so you do not need to add it manually.

## Aiven database setup

Option 1: Run `database.sql` in Aiven first.

Option 2: Start the Render service. `server.js` will automatically create the tables and seed demo records if the tables are empty.

## Demo accounts

```txt
Admin: admin@freshkart.ph / admin123
Farmer: juan@freshkart.ph / farmer123
Farmer: maria@freshkart.ph / farmer123
Resident: anna@freshkart.ph / resident123
Resident: ben@freshkart.ph / resident123
```

## Local test

Create `.env` using `.env.example`, then run:

```bash
npm install
npm run build
npm start
```

Open:

```txt
http://localhost:3000
```

Health check:

```txt
http://localhost:3000/api/health
```
