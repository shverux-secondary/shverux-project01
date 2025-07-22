# FastAPI Authentication System

A complete authentication system built with FastAPI and SQLite that integrates with your existing HTML/CSS/JavaScript frontend.

## Features

- ✅ User Registration with validation
- ✅ User Login with password hashing
- ✅ SQLite database integration
- ✅ Password hashing with bcrypt
- ✅ CORS support for frontend integration
- ✅ Input validation and error handling
- ✅ Clean API responses
- ✅ Automatic database table creation

## Project Structure

```
fastapi-auth/
├── main.py              # FastAPI application entry point
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic request/response models
├── database.py          # Database connection and session management
├── requirements.txt     # Python dependencies
├── script_updated.js    # Updated frontend JavaScript
├── auth_system.db       # SQLite database (created automatically)
└── README.md           # This file
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 2. Run the FastAPI Server

```bash
# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 3. Update Your Frontend

Replace your current `script.js` with `script_updated.js` to enable API integration:

```html
<script src="script_updated.js"></script>
```

## API Endpoints

### 1. Root Endpoint
- **GET** `/`
- Returns server status

### 2. User Registration
- **POST** `/register`
- **Request Body:**
```json
{
  "username": "your_username",
  "email": "your_email@example.com", 
  "password": "your_password"
}
```
- **Response:**
```json
{
  "id": 1,
  "username": "your_username",
  "email": "your_email@example.com",
  "message": "User registered successfully",
  "is_active": true,
  "created_at": "2025-01-22T06:17:00.000000"
}
```

### 3. User Login
- **POST** `/login`
- **Request Body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "your_username",
    "email": "your_email@example.com",
    "message": "Login successful",
    "is_active": true,
    "created_at": "2025-01-22T06:17:00.000000"
  }
}
```

## Database Schema

The SQLite database contains a `users` table with the following structure:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Validation Rules

### Username
- Minimum 3 characters
- Maximum 50 characters
- Only letters, numbers, underscores, and hyphens allowed

### Password
- Minimum 6 characters
- Maximum 100 characters

### Email
- Valid email format required
- Must be unique in the database

## Frontend Integration

The updated JavaScript file (`script_updated.js`) includes:

- API calls to FastAPI backend
- Proper error handling
- Success/error message display
- Form validation
- Local storage for user session (basic implementation)

### Key Frontend Features:

1. **Real API Integration**: Forms now make actual HTTP requests to your FastAPI backend
2. **Error Handling**: Network errors and API errors are properly displayed
3. **Loading States**: Shows loading messages during API calls
4. **Success Feedback**: Displays welcome messages and success confirmations
5. **Server Connection Test**: Automatically tests server connection on page load

## Running the Complete System

1. **Start the FastAPI server:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Open your HTML file** in a browser (make sure you're using `script_updated.js`)

3. **Test the system:**
   - Try registering a new user
   - Try logging in with the registered credentials
   - Check the browser console for debug information

## Development Notes

### CORS Configuration
The FastAPI app is configured to allow requests from common frontend development ports:
- `http://localhost:3000` (React default)
- `http://localhost:8080` 
- `http://localhost:5500` (Live Server default)
- And others

### Database
- SQLite database file (`auth_system.db`) is created automatically
- Tables are created on first run
- No manual database setup required

### Security Features
- Passwords are hashed using bcrypt
- Username and email uniqueness enforced
- Input validation on both frontend and backend
- SQL injection protection via SQLAlchemy ORM

## API Documentation

Once the server is running, visit:
- **Interactive API docs:** `http://localhost:8000/docs`
- **Alternative docs:** `http://localhost:8000/redoc`

## Troubleshooting

### Common Issues:

1. **"Network error" messages in frontend:**
   - Make sure FastAPI server is running
   - Check the `API_BASE_URL` in `script_updated.js`
   - Verify CORS configuration

2. **"Username already registered" error:**
   - Each username must be unique
   - Try a different username

3. **Database connection issues:**
   - SQLite database is created automatically
   - Check file permissions in the project directory

4. **Import errors:**
   - Make sure all dependencies are installed: `pip install -r requirements.txt`

## Next Steps

This basic authentication system can be extended with:

- JWT token authentication for sessions
- Password reset functionality
- Email verification
- User profile management
- Role-based access control
- Production database (PostgreSQL, MySQL)

## Architecture Benefits

This FastAPI authentication system provides:

- **Scalability**: Easy to extend with new features
- **Security**: Proper password hashing and validation
- **Documentation**: Automatic API documentation
- **Type Safety**: Python type hints throughout
- **Standards**: Follows REST API best practices
- **Flexibility**: Easy to integrate with different frontends
