# 🎓 Student Abroad Platform - Complete API Documentation

A comprehensive university recommendation platform with modern UI and robust backend API.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🔧 Installation & Setup](#-installation--setup)
- [📡 API Documentation](#-api-documentation)
- [🔐 Authentication](#-authentication)
- [🎯 Frontend-Backend Connection](#-frontend-backend-connection)
- [🗄️ Database Schema](#️-database-schema)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🛠️ Troubleshooting](#️-troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**

### 1. Clone & Setup
```bash
git clone <repository-url>
cd student-abroad-platform

# Backend Setup
cd backend
pip install -r requirements.txt
python app.py

# Frontend Setup (new terminal)
cd frontend
npm install
npm start
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Frontend│ ◄──────────────► │  Flask Backend  │
│   (Port 3000)   │                 │   (Port 5000)   │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
    ┌────▼────┐                         ┌────▼────┐
    │ Browser │                         │Database │
    │ Storage │                         │ SQLite  │
    └─────────┘                         └─────────┘
```

### Technology Stack

#### Frontend
- **React 18** - UI Framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **CSS3** - Modern styling with gradients

#### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing
- **SQLite** - Development database

---

## 🔧 Installation & Setup

### Backend Setup

1. **Create Virtual Environment**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Variables**
Create `.env` file in backend directory:
```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///database/student_abroad.db
FLASK_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

4. **Initialize Database**
```bash
python -c "from models import init_db; init_db()"
```

5. **Start Backend Server**
```bash
python app.py
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Variables**
Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

3. **Start Development Server**
```bash
npm start
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### 🏛️ University Endpoints

#### Search Universities
```http
GET /api/universities?q=harvard&country=US&min_tuition=10000&max_tuition=60000&sort_by=ranking&sort_order=asc&page=1&per_page=20
```

**Query Parameters:**
- `q` - Search query (university name or city)
- `country` - Country code(s) (comma-separated)
- `field` - Field(s) of study (comma-separated)
- `min_tuition`, `max_tuition` - Tuition fee range
- `min_cgpa`, `max_cgpa` - CGPA requirement range
- `min_gre`, `max_gre` - GRE score range
- `min_ielts`, `max_ielts` - IELTS score range
- `min_toefl`, `max_toefl` - TOEFL score range
- `type` - University type (Public/Private)
- `sort_by` - Sort field (ranking, tuition_fee, acceptance_rate, name)
- `sort_order` - Sort order (asc, desc)
- `page` - Page number
- `per_page` - Results per page (max 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "id": 1,
        "name": "Harvard University",
        "country": "US",
        "city": "Cambridge",
        "state": "Massachusetts",
        "ranking": 1,
        "fields": ["Computer Science", "Engineering", "Medicine"],
        "tuition_fee": 51143,
        "living_cost": 18389,
        "application_fee": 75,
        "min_cgpa": 3.9,
        "min_gre": 330,
        "min_ielts": 7.5,
        "min_toefl": 109,
        "acceptance_rate": 0.05,
        "website": "https://www.harvard.edu",
        "established": 1636,
        "type": "Private",
        "student_population": 23000,
        "international_students": 25,
        "logo": "https://logos-world.net/wp-content/uploads/2021/09/Harvard-Logo.png"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 70,
      "pages": 4,
      "has_prev": false,
      "has_next": true
    }
  }
}
```

#### Get University Details
```http
GET /api/universities/{id}
```

#### Get Countries
```http
GET /api/universities/countries
```

#### Get Fields of Study
```http
GET /api/universities/fields
```

#### Compare Universities
```http
POST /api/universities/compare
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "university_ids": [1, 2, 3]
}
```

### 📚 Bookmark Endpoints

#### Get User Bookmarks
```http
GET /api/bookmarks
Authorization: Bearer <access_token>
```

#### Add Bookmark
```http
POST /api/bookmarks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "university_id": 1
}
```

#### Remove Bookmark
```http
DELETE /api/bookmarks/{university_id}
Authorization: Bearer <access_token>
```

### ⭐ Recommendation Endpoints

#### Get Recommendations
```http
GET /api/recommendations
Authorization: Bearer <access_token>
```

#### Generate Recommendations
```http
POST /api/recommendations/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "preferences": {
    "countries": ["US", "UK", "CA"],
    "fields": ["Computer Science", "Engineering"],
    "budget_max": 60000,
    "cgpa": 3.8,
    "gre_score": 325,
    "ielts_score": 7.5
  }
}
```

### 👤 User Profile Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Doe",
  "cgpa": 3.8,
  "gre_score": 325,
  "ielts_score": 7.5,
  "preferred_countries": ["US", "UK"],
  "preferred_fields": ["Computer Science"],
  "budget_max": 60000
}
```

---

## 🔐 Authentication

### JWT Token System

The API uses **JSON Web Tokens (JWT)** for authentication:

1. **Access Token** - Short-lived (15 minutes), used for API requests
2. **Refresh Token** - Long-lived (30 days), used to get new access tokens

### Token Usage

Include the access token in the Authorization header:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Frontend Token Management

The frontend automatically handles token storage and refresh:

```javascript
// Stored in localStorage
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);

// Automatic refresh on 401 responses
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Auto-refresh token logic
    }
  }
);
```

---

## 🎯 Frontend-Backend Connection

### API Service Layer

The frontend uses a centralized API service:

```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic token injection
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service Classes

#### University Service
```javascript
// frontend/src/services/universityService.js
class UniversityService {
  async searchUniversities(params) {
    const response = await api.get('/universities', { params });
    return response.data;
  }

  async getUniversityById(id) {
    const response = await api.get(`/universities/${id}`);
    return response.data;
  }
}
```

#### Auth Service
```javascript
// frontend/src/services/authService.js
class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    this.setTokens(response.data);
    return response.data;
  }

  setTokens({ access_token, refresh_token }) {
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
  }
}
```

### Error Handling

```javascript
// Centralized error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cgpa FLOAT,
    gre_score INTEGER,
    ielts_score FLOAT,
    toefl_score INTEGER,
    preferred_countries TEXT,
    preferred_fields TEXT,
    budget_max FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Universities Data
```json
// backend/data/universities.json
[
  {
    "id": 1,
    "name": "Harvard University",
    "country": "US",
    "city": "Cambridge",
    "state": "Massachusetts",
    "ranking": 1,
    "fields": ["Computer Science", "Engineering"],
    "tuition_fee": 51143,
    "living_cost": 18389,
    "application_fee": 75,
    "min_cgpa": 3.9,
    "min_gre": 330,
    "min_ielts": 7.5,
    "min_toefl": 109,
    "acceptance_rate": 0.05,
    "website": "https://www.harvard.edu",
    "established": 1636,
    "type": "Private",
    "student_population": 23000,
    "international_students": 25,
    "logo": "https://logos-world.net/wp-content/uploads/2021/09/Harvard-Logo.png"
  }
]
```

### Bookmarks Table
```sql
CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    university_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, university_id)
);
```

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing with curl

#### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Test Universities
```bash
# Search universities
curl "http://localhost:5000/api/universities?q=harvard&per_page=5"

# Get university details
curl "http://localhost:5000/api/universities/1"
```

### Testing with Postman

Import the API collection:
```json
{
  "info": {
    "name": "Student Abroad Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Create Procfile**
```
web: python app.py
```

2. **Update app.py for production**
```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

3. **Deploy**
```bash
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)

1. **Build for production**
```bash
npm run build
```

2. **Update environment variables**
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=sqlite:///database/student_abroad.db
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't connect to backend
```
Access to XMLHttpRequest at 'http://localhost:5000/api/universities' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: Check CORS configuration in backend
```python
# backend/app.py
CORS(app, origins=['http://localhost:3000'])
```

#### 2. 401 Unauthorized
**Problem**: API returns 401 for authenticated requests
```json
{"error": "Token has expired", "code": "TOKEN_EXPIRED"}
```

**Solution**: Check token storage and refresh logic
```javascript
// Check if token exists
const token = localStorage.getItem('accessToken');
if (!token) {
  // Redirect to login
}
```

#### 3. Database Connection Issues
**Problem**: Backend can't connect to database
```
sqlite3.OperationalError: no such table: users
```

**Solution**: Initialize database
```bash
cd backend
python -c "from models import init_db; init_db()"
```

#### 4. Port Already in Use
**Problem**: Can't start server on port 3000/5000
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Kill existing process or use different port
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Debug Mode

#### Backend Debug
```python
# Enable Flask debug mode
app.run(debug=True)
```

#### Frontend Debug
```bash
# Enable verbose logging
REACT_APP_DEBUG=true npm start
```

### Logging

#### Backend Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)

@app.before_request
def log_request():
    app.logger.info(f'{request.method} {request.url}')
```

#### Frontend Logging
```javascript
// Enable axios request/response logging
api.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

---

## 📞 Support & Contributing

### Getting Help
- **Issues**: Create an issue on GitHub
- **Documentation**: Check this README
- **API Testing**: Use Postman collection

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Workflow
```bash
# 1. Start backend
cd backend
python app.py

# 2. Start frontend (new terminal)
cd frontend
npm start

# 3. Make changes and test
# 4. Commit and push
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Quick Reference

### Useful Commands
```bash
# Backend
python app.py                    # Start backend server
pip install -r requirements.txt  # Install dependencies
python -c "from models import init_db; init_db()"  # Initialize DB

# Frontend  
npm start                        # Start development server
npm run build                    # Build for production
npm test                         # Run tests

# Both
docker-compose up               # Start with Docker
```

### Important URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **API Info**: http://localhost:5000/api

### Environment Variables
```env
# Backend (.env)
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///database/student_abroad.db
ALLOWED_ORIGINS=http://localhost:3000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

**Happy Coding! 🚀**