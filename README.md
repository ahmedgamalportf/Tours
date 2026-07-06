# 🌍 Tours API

A scalable RESTful API for a **Travel Booking Platform** built with **Node.js**, **Express.js**, and **MongoDB**.

The platform enables users to explore and book hotels, rooms, tours, and boats while providing administrators with a complete management system.

The project follows a layered architecture (Routes → Controllers → Services → Models) to keep the code clean, maintainable, and scalable.

---

# 🚀 Features

## 🔐 Authentication

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes
- Role-based Authorization
- Email Normalization
- Duplicate Email Validation

---

## 👤 User Management

- Register New Users
- Login Existing Users
- View User Profile
- Update User Profile
- Change Password
- Admin/User Roles

---

## 🏨 Hotel Management

- Create Hotel
- Update Hotel
- Delete Hotel
- Get Hotel Details
- Get All Hotels
- Search Hotels
- Hotel Images
- Hotel Ratings

---

## 🛏️ Room Management

- Add Rooms
- Update Room
- Delete Room
- Room Availability
- Room Capacity
- Room Pricing
- Room Images

---

## 🛥️ Boat Management

- Create Boat
- Update Boat
- Delete Boat
- Boat Availability
- Capacity Management
- Pricing

---

## 🎯 Tour Management

- Create Tours
- Update Tours
- Delete Tours
- Tour Categories
- Tour Duration
- Tour Pricing
- Tour Capacity

---

## 📅 Booking System

- Book Hotels
- Book Rooms
- Book Tours
- Book Boats
- Booking Status

    - Pending
    - Confirmed
    - Cancelled

- Availability Checking
- Booking History

---

## ⭐ Reviews

- Add Review
- Update Review
- Delete Review
- Ratings
- Average Rating

---

## 🔎 Search & Filtering

- Search by Name
- Search by Location
- Search by Category
- Price Filtering
- Rating Filtering
- Availability Filtering

---

## 📄 Pagination

- Page
- Limit
- Sorting

---

## 📤 Image Upload

- Hotel Images
- Room Images
- Boat Images
- Tour Images

---

## 🛡️ Security

- JWT Authentication
- Password Hashing
- Role Authorization
- Protected Routes
- Environment Variables
- Input Validation

---

## 📚 API Documentation

- Swagger UI
- OpenAPI Documentation

---

## 🐳 Docker Support

- Dockerfile
- Docker Compose

---

# 🛠️ Technologies

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcrypt

## Utilities

- dotenv
- CORS

## Documentation

- Swagger

## Testing

- Jest
- Supertest

---

# 📂 Project Structure

```
Tours
│
├── src
│   │
│   ├── config
│   │      db.js
│   │
│   ├── controllers
│   │      authController.js
│   │      hotelController.js
│   │      roomController.js
│   │      boatController.js
│   │      tourController.js
│   │      bookingController.js
│   │
│   ├── middleware
│   │      authMiddleware.js
│   │      roleMiddleware.js
│   │
│   ├── models
│   │      User.js
│   │      Hotel.js
│   │      Room.js
│   │      Boat.js
│   │      Tour.js
│   │      Booking.js
│   │      Review.js
│   │
│   ├── routes
│   │      authRoutes.js
│   │      hotelRoutes.js
│   │      roomRoutes.js
│   │      boatRoutes.js
│   │      tourRoutes.js
│   │      bookingRoutes.js
│   │
│   ├── services
│   │      authService.js
│   │      hotelService.js
│   │      roomService.js
│   │      boatService.js
│   │      tourService.js
│   │      bookingService.js
│   │
│   ├── validators
│   │
│   ├── utils
│   │
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

# 🔗 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/v1/auth/register | Register User |
| POST | /api/v1/auth/login | Login User |
| GET | /api/v1/auth/profile | Get User Profile |

---

## Hotels

| Method | Endpoint |
|---------|----------|
| GET | /api/v1/hotels |
| GET | /api/v1/hotels/:id |
| POST | /api/v1/hotels |
| PATCH | /api/v1/hotels/:id |
| DELETE | /api/v1/hotels/:id |

---

## Rooms

| Method | Endpoint |
|---------|----------|
| GET | /api/v1/rooms |
| GET | /api/v1/rooms/:id |
| POST | /api/v1/rooms |
| PATCH | /api/v1/rooms/:id |
| DELETE | /api/v1/rooms/:id |

---

## Boats

| Method | Endpoint |
|---------|----------|
| GET | /api/v1/boats |
| GET | /api/v1/boats/:id |
| POST | /api/v1/boats |
| PATCH | /api/v1/boats/:id |
| DELETE | /api/v1/boats/:id |

---

## Tours

| Method | Endpoint |
|---------|----------|
| GET | /api/v1/tours |
| GET | /api/v1/tours/:id |
| POST | /api/v1/tours |
| PATCH | /api/v1/tours/:id |
| DELETE | /api/v1/tours/:id |

---

## Bookings

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/bookings |
| GET | /api/v1/bookings |
| GET | /api/v1/bookings/:id |
| PATCH | /api/v1/bookings/:id |
| DELETE | /api/v1/bookings/:id |

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/ahmedgamalportf/Tours.git
```

Install dependencies

```bash
npm install
```

Create an environment file

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET_KEY
```

Run the server

```bash
npm run dev
```

---

# 📈 Project Roadmap

- ✅ Authentication
- ✅ Authorization
- ⏳ Hotel CRUD
- ⏳ Room CRUD
- ⏳ Boat CRUD
- ⏳ Tour CRUD
- ⏳ Booking System
- ⏳ Reviews
- ⏳ Image Upload
- ⏳ Search & Filtering
- ⏳ Pagination
- ⏳ Swagger Documentation
- ⏳ Docker Support
- ⏳ Unit Testing
- ⏳ Integration Testing

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Ahmed Gamal**

Software Engineer

GitHub: https://github.com/ahmedgamalportf