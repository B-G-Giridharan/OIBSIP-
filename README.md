**TASK 1** · Online Reservation System 

**Objective:** Build a GUI-based train/transport reservation system where users can log in, book tickets, and cancel bookings using a PNR number. 

**Tech Stack:** Java (Swing or JavaFX for GUI), JDBC, MySQL or SQLite 

**Feature Checklist:** 
● [ ] Login Form: username and password fields; access denied for invalid credentials 
● [ ] Reservation Form: fields for passenger name, train number, train name (auto-populated from train number), class type, date of journey, source station, destination station
● [ ] Insert/Book button that saves the reservation to the database and generates a PNR number (auto-generated unique ID) 
● [ ] Confirmation dialog showing booking details after successful reservation
● [ ] Cancellation Form: PNR number input field and Fetch button that retrieves and displays the full booking details 
● [ ] Confirm cancellation button with an "Are you sure?" dialog; removes the booking from the database on confirmation
● [ ] Basic input validation: no empty required fields, valid date format, numeric train number

**Self-Sourcing Guideline:** Search "Java Swing JDBC login form tutorial" on YouTube for GUI and database connection patterns. For database setup, search "SQLite Java JDBC Maven setup" (SQLite requires no separate server). Reference the official Java documentation for JFrame, JTextField, JComboBox, and PreparedStatement for SQL injection prevention. 


# RailReserve

Smart Online Train Reservation System

RailReserve is a full-stack web application for booking, viewing, and cancelling train reservations. It uses a React TypeScript frontend, an Express REST API, and MySQL with parameterized queries.

## Features

- Username and password authentication with hashed passwords
- Dashboard with booking totals, recent bookings, and quick actions
- Train ticket booking with automatic train-name lookup
- Unique PNR generation (`RR` + 8-digit random identifier)
- Booking confirmation with print support
- PNR lookup and reservation cancellation
- Searchable booking list
- Responsive railway-inspired interface with glass-style cards, toasts, and validation

## Tech stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MySQL (`mysql2`)
- Auth: bcrypt password hashing and HTTP-only JWT cookies
- Validation: shared rules on both client and server

## Folder structure

```text
.
├── backend/
│   └── src/
│       ├── db/                    # Database init and seeding
│       ├── middleware/            # Auth and error handling
│       ├── routes/                # REST API routes
│       ├── utils/                 # PNR generation
│       ├── validation/            # Server-side input checks
│       └── server.js
├── frontend/
│   └── src/
│       ├── components/            # Reusable UI
│       ├── context/               # Auth and toast state
│       ├── pages/                 # Login, dashboard, booking pages
│       ├── services/              # REST API client
│       ├── types.ts
│       └── utils/                 # Client-side validation
├── package.json
└── README.md
```

## Database schema

### users

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER | Primary key |
| username | TEXT | Unique, case-insensitive |
| password_hash | TEXT | bcrypt hash |
| created_at | TEXT | UTC timestamp |

### trains

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER | Primary key |
| train_number | TEXT | Unique |
| train_name | TEXT | Display name |

### reservations

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER | Primary key |
| pnr | TEXT | Unique, format `RRxxxxxxxx` |
| user_id | INTEGER | Foreign key to `users.id` |
| passenger_name | TEXT | |
| train_number | TEXT | Foreign key to `trains.train_number` |
| train_name | TEXT | Copied from trains table |
| class_type | TEXT | First AC, Second AC, Third AC, Sleeper, General |
| journey_date | TEXT | `YYYY-MM-DD` |
| source_station | TEXT | |
| destination_station | TEXT | |
| booking_status | TEXT | `CONFIRMED` or `CANCELLED` |
| created_at | TEXT | UTC timestamp |

Indexes exist on PNR, user, train number, journey date, and passenger name. Foreign keys are enabled.

## Installation

Prerequisites: Node.js 18 or later.

From the project root:

```bash
npm install
npm run install:all
```

Or install each package separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## MySQL database setup

The backend uses `train_reservation` on MySQL at `localhost:3306` by default. Configure the credentials through environment variables:

- `MYSQL_HOST` — default `localhost`
- `MYSQL_PORT` — default `3306`
- `MYSQL_DATABASE` — default `train_reservation`
- `MYSQL_USER` — default `root`
- `MYSQL_PASSWORD` — required; never store it in source code

The tables are created automatically on backend startup. To initialize without starting the API:

```powershell
cd backend
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "your-mysql-password"
npm run init-db
```

The complete schema is also available in [java-mysql/schema.sql](java-mysql/schema.sql).

## How to run the backend

```powershell
cd backend
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "your-mysql-password"
npm start
```

Development watch mode:

```bash
cd backend
npm run dev
```

The API listens on [http://localhost:4000](http://localhost:4000).

Optional environment variables:

- `PORT` — API port (default `4000`)
- `CLIENT_ORIGIN` — frontend origin for CORS (default `http://localhost:5173`)
- `MYSQL_HOST` — MySQL host (default `localhost`)
- `MYSQL_PORT` — MySQL port (default `3306`)
- `MYSQL_DATABASE` — database name (default `train_reservation`)
- `MYSQL_USER` — database user (default `root`)
- `MYSQL_PASSWORD` — required MySQL password
- `JWT_SECRET` — signing secret for session tokens
- `NODE_ENV` — set to `production` to mark cookies `Secure`

## How to run the frontend

```bash
cd frontend
npm run dev
```

The Vite app runs at [http://localhost:5173](http://localhost:5173) and proxies `/api` requests to the backend.

Run both from the project root:

```bash
npm run dev
```

## Demo login credentials

- Username: `demo`
- Password: `Demo@123`

These credentials are stored as a bcrypt hash in MySQL. Authentication is performed only on the backend.

## API endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Log in and set HTTP-only session cookie |
| POST | `/api/auth/logout` | No | Clear session cookie |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/trains` | Yes | List sample trains |
| GET | `/api/trains/:trainNumber` | Yes | Look up train name |
| GET | `/api/reservations/summary` | Yes | Dashboard totals and recent bookings |
| GET | `/api/reservations` | Yes | List current user's bookings (supports `pnr`, `passenger`, `trainNumber`, `journeyDate` query params) |
| POST | `/api/reservations` | Yes | Create a booking and generate a PNR |
| GET | `/api/reservations/:pnr` | Yes | Fetch one booking |
| DELETE | `/api/reservations/:pnr` | Yes | Mark a booking as cancelled |
| GET | `/api/health` | No | Health check |

Typical JSON error shape:

```json
{ "message": "Access denied. Invalid username or password." }
```

Validation errors from booking may also include an `errors` object keyed by field name.

## Screenshots

Add screenshots of the following screens after a local demo:

- Login
- Dashboard
- Book Train Ticket
- Booking confirmation
- My Bookings
- Cancel Reservation

Place image files in a `docs/screenshots/` folder and link them here.

-- 

## MYSQL WORKBENCH
## user database -
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/f8fa49da-0380-41c7-90dc-fd0447abc392" />
## train database
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/2a4e968f-4f9e-44db-b886-8d62219891e7" />
## reservations database
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/9ea19ae8-b302-43f3-8213-d844e6dc8af7" />

--

## project screenshots
## Login page 
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/1142c315-d552-4eaf-9372-296897d28cc6" />
## Dashboard
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/28c5cfb6-6c12-4439-8995-2c664c1801d7" />
## Booking page
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/f583e01b-74e2-46b4-90b4-3ccdeb965b4e" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/4e261812-c79b-418f-a037-82ad96412fc0" />
## Cancellations
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/636a1a46-3949-4898-837d-0d0ebea5df22" />


## Future enhancements

- Passenger age, gender, and berth preference
- Multi-passenger bookings on one PNR
- Seat availability and waitlist handling
- Email or SMS ticket delivery
- Admin console for train and fare management
- Payment gateway integration
- Role-based access for station staff

## Security notes

- Passwords are hashed with bcrypt and never stored in plain text
- SQL uses prepared statements for all user-supplied values
- JWT session cookies are HTTP-only
- Frontend validation is mirrored and enforced on the server
