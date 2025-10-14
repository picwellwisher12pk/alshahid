## Al-Shahid Academy API Documentation

This document describes the REST API endpoints for the Al-Shahid Academy platform. All endpoints return JSON responses.

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe" (optional)
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "createdAt": "2025-10-15T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: User already exists
- `500`: Internal server error

---

### Login
Authenticate a user and receive access tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "emailVerified": false,
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- `accessToken`: HTTP-only cookie, expires in 15 minutes
- `refreshToken`: HTTP-only cookie, expires in 7 days

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid credentials
- `500`: Internal server error

---

### Logout
Invalidate user session and clear tokens.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Cookie: accessToken=...; refreshToken=...
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Cookie: refreshToken=...
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401`: Invalid or expired refresh token

---

### Get Current User
Retrieve the authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Cookie: accessToken=...
OR
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "emailVerified": false,
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found

---

## Trial Request Endpoints

### Create Trial Request
Submit a new trial class request (Public endpoint).

**Endpoint:** `POST /api/trial-requests`

**Request Body:**
```json
{
  "parentName": "Jane Smith",
  "studentName": "Mohammed Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "course": "Quran Memorization",
  "preferredTime": "Weekday evenings",
  "additionalNotes": "Student is a beginner"
}
```

**Success Response (201):**
```json
{
  "message": "Trial request submitted successfully",
  "data": {
    "id": "clxxx...",
    "parentName": "Jane Smith",
    "studentName": "Mohammed Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "course": "Quran Memorization",
    "preferredTime": "Weekday evenings",
    "additionalNotes": "Student is a beginner",
    "status": "PENDING",
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  }
}
```

---

### Get All Trial Requests
Retrieve all trial requests (Protected - requires authentication).

**Endpoint:** `GET /api/trial-requests`

**Query Parameters:**
- `status`: Filter by status (PENDING, CONTACTED, SCHEDULED, COMPLETED, CANCELLED)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Headers:**
```
Cookie: accessToken=...
OR
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "parentName": "Jane Smith",
      "studentName": "Mohammed Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "course": "Quran Memorization",
      "preferredTime": "Weekday evenings",
      "additionalNotes": "Student is a beginner",
      "status": "PENDING",
      "createdAt": "2025-10-15T00:00:00.000Z",
      "updatedAt": "2025-10-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### Get Single Trial Request
Retrieve a specific trial request by ID (Protected).

**Endpoint:** `GET /api/trial-requests/[id]`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "data": {
    "id": "clxxx...",
    "parentName": "Jane Smith",
    // ... other fields
  }
}
```

---

### Update Trial Request
Update trial request status (Protected).

**Endpoint:** `PATCH /api/trial-requests/[id]`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "status": "CONTACTED"
}
```

**Success Response (200):**
```json
{
  "message": "Trial request updated successfully",
  "data": {
    "id": "clxxx...",
    "status": "CONTACTED",
    // ... other fields
  }
}
```

---

### Delete Trial Request
Delete a trial request (Protected).

**Endpoint:** `DELETE /api/trial-requests/[id]`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "message": "Trial request deleted successfully"
}
```

---

## Contact Message Endpoints

### Create Contact Message
Submit a new contact message (Public endpoint).

**Endpoint:** `POST /api/contact-messages`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about courses",
  "message": "I would like to know more about your Tajweed course..."
}
```

**Success Response (201):**
```json
{
  "message": "Contact message submitted successfully",
  "data": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Question about courses",
    "message": "I would like to know more...",
    "status": "UNREAD",
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  }
}
```

---

### Get All Contact Messages
Retrieve all contact messages (Protected).

**Endpoint:** `GET /api/contact-messages`

**Query Parameters:**
- `status`: Filter by status (UNREAD, READ, REPLIED, ARCHIVED)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Question about courses",
      "message": "I would like to know more...",
      "status": "UNREAD",
      "createdAt": "2025-10-15T00:00:00.000Z",
      "updatedAt": "2025-10-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Get Single Contact Message
Retrieve a specific contact message by ID (Protected).

**Endpoint:** `GET /api/contact-messages/[id]`

---

### Update Contact Message
Update contact message status (Protected).

**Endpoint:** `PATCH /api/contact-messages/[id]`

**Request Body:**
```json
{
  "status": "READ"
}
```

---

### Delete Contact Message
Delete a contact message (Protected).

**Endpoint:** `DELETE /api/contact-messages/[id]`

---

## Mobile App Integration

### Authentication Flow for Mobile Apps

1. **Login:**
   ```javascript
   const response = await fetch('https://your-api.com/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const { accessToken, user } = await response.json();
   // Store accessToken securely (e.g., SecureStore in React Native)
   ```

2. **Authenticated Requests:**
   ```javascript
   const response = await fetch('https://your-api.com/api/trial-requests', {
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     }
   });
   ```

3. **Token Refresh:**
   ```javascript
   const response = await fetch('https://your-api.com/api/auth/refresh', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${refreshToken}`
     }
   });
   const { accessToken } = await response.json();
   ```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": [...]  // Optional validation details
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## Rate Limiting

To prevent abuse, API endpoints may be rate-limited. Consider implementing rate limiting in production.

---

## Security Notes

1. All authentication endpoints use HTTP-only cookies for web applications
2. Mobile apps should use Bearer token authentication
3. Tokens expire after 15 minutes (access) and 7 days (refresh)
4. Always use HTTPS in production
5. Passwords are hashed using bcrypt with 12 salt rounds
6. JWT tokens are signed with HS256 algorithm
