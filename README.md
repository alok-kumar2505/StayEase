# StayEase

A full-stack accommodation listing platform built with Node.js, Express, and MongoDB. Users can browse listings, create their own listings, leave reviews, and manage their accounts.

## 🌟 Features

- **User Authentication**: Sign up, login, and logout with secure passport authentication
- **Listing Management**: Create, read, update, and delete accommodation listings
- **Reviews System**: Users can leave reviews on listings with ratings
- **Image Upload**: Upload listing images to Cloudinary cloud storage
- **Geolocation**: Integration with Mapbox for location-based features
- **Session Management**: Secure session handling with MongoDB store
- **Flash Messages**: Feedback messages for user actions
- **Authorization**: Only listing owners can edit/delete their listings; only review authors can delete reviews

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **Passport.js** - Authentication middleware
- **Passport-Local** - Username/password strategy
- **Express-Session** - Session management
- **Connect-Mongo** - MongoDB session store

### File & Image Upload
- **Multer** - File upload middleware
- **Cloudinary** - Cloud image storage
- **Multer-Storage-Cloudinary** - Integration with Cloudinary

### Frontend
- **EJS** - Templating engine
- **EJS-Mate** - Layout support for EJS
- **Bootstrap** - CSS framework (in public folder)
- **Mapbox GL** - Interactive maps

### Utilities
- **Joi** - Data validation
- **Method-Override** - HTTP method override for form submissions
- **Connect-Flash** - Flash message support
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
StayEase/
├── app.js                    # Main application file
├── cloudConfig.js            # Cloudinary configuration
├── middleware.js             # Custom middleware functions
├── schema.js                 # Joi validation schemas
├── package.json              # Dependencies
│
├── controllers/              # Request handlers
│   ├── listings.js          # Listing controllers
│   ├── reviews.js           # Review controllers
│   └── users.js             # User controllers
│
├── models/                   # MongoDB schemas
│   ├── listing.js           # Listing model
│   ├── review.js            # Review model
│   └── user.js              # User model
│
├── routes/                   # API routes
│   ├── listing.js           # Listing routes
│   ├── review.js            # Review routes
│   └── user.js              # User routes
│
├── views/                    # EJS templates
│   ├── layouts/
│   │   └── boilerplate.ejs  # Main layout template
│   ├── includes/
│   │   ├── navbar.ejs       # Navigation bar
│   │   ├── footer.ejs       # Footer
│   │   └── flash.ejs        # Flash messages
│   ├── listings/
│   │   ├── index.ejs        # All listings page
│   │   ├── show.ejs         # Single listing page
│   │   ├── new.ejs          # Create listing form
│   │   └── edit.ejs         # Edit listing form
│   ├── users/
│   │   ├── login.ejs        # Login page
│   │   └── signup.ejs       # Signup page
│   └── error.ejs            # Error page
│
├── public/                   # Static files
│   ├── css/
│   │   ├── style.css        # Main styles
│   │   └── rating.css       # Rating component styles
│   └── js/
│       ├── script.js        # Client-side scripts
│       └── map.js           # Mapbox integration
│
├── utils/                    # Utility functions
│   ├── ExpressError.js      # Custom error class
│   └── WrapAsync.js         # Async error wrapper
│
├── init/                     # Database initialization
│   ├── index.js             # Initialization script
│   └── data.js              # Sample data
│
└── .env                      # Environment variables

```

## 🚀 API Endpoints

### Listings Endpoints

#### GET `/listings`
- **Description**: Get all listings
- **Auth Required**: No
- **Request**: None
- **Response** (200 OK):
  ```javascript
  {
    allListings: [
      {
        _id: ObjectId,
        title: string,
        description: string,
        price: number,
        location: string,
        country: string,
        image: { url: string, filename: string },
        owner: ObjectId,
        reviews: [ObjectId],
        geometry: { type: "Point", coordinates: [long, lat] }
      }
    ]
  }
  ```
- **Error** (500): Database connection error

---

#### GET `/listings/new`
- **Description**: Render create listing form page
- **Auth Required**: Yes
- **Request**: None
- **Response** (200 OK): HTML form page
- **Error** (302): Redirects to login if not authenticated

---

#### POST `/listings`
- **Description**: Create new listing with image upload
- **Auth Required**: Yes
- **Request**:
  ```javascript
  {
    listing: {
      title: string (required),
      description: string (required),
      price: number (required),
      location: string (required - address for geolocation),
      country: string (required)
    },
    listing[image]: file (required - image file)
  }
  ```
- **Response** (302): Redirect to `/listings` with success flash message
- **Errors**:
  - 400: Validation failed (missing fields)
  - 401: Not authenticated
  - 500: Database error, Cloudinary upload error

---

#### GET `/listings/:id`
- **Description**: Get specific listing details with reviews and owner info
- **Auth Required**: No
- **Request**: URL parameter `id` (MongoDB ObjectId)
- **Response** (200 OK): HTML page with listing details including:
  ```javascript
  {
    listing: {
      _id: ObjectId,
      title: string,
      description: string,
      price: number,
      location: string,
      country: string,
      image: { url: string, filename: string },
      owner: { _id, username, email },
      reviews: [
        { 
          _id: ObjectId,
          rating: number,
          comment: string,
          author: { _id, username }
        }
      ],
      geometry: { type: "Point", coordinates: [long, lat] }
    }
  }
  ```
- **Errors**:
  - 404: Listing not found, redirects to `/listings` with error message
  - 500: Database error

---

#### GET `/listings/:id/edit`
- **Description**: Render edit listing form page
- **Auth Required**: Yes
- **Request**: URL parameter `id` (MongoDB ObjectId)
- **Response** (200 OK): HTML edit form page with pre-filled listing data
- **Errors**:
  - 401: Not authenticated
  - 403: User is not the listing owner
  - 404: Listing not found, redirects with error message
  - 500: Database error

---

#### PUT `/listings/:id`
- **Description**: Update listing details and/or image
- **Auth Required**: Yes
- **Request**:
  ```javascript
  {
    listing: {
      title: string (optional),
      description: string (optional),
      price: number (optional),
      location: string (optional),
      country: string (optional)
    },
    listing[image]: file (optional - new image file)
  }
  ```
- **Response** (302): Redirect to `/listings/:id` with success message
- **Errors**:
  - 400: Validation failed
  - 401: Not authenticated
  - 403: User is not the listing owner
  - 404: Listing not found
  - 500: Database error, Cloudinary upload error

---

#### DELETE `/listings/:id`
- **Description**: Delete listing and associated reviews
- **Auth Required**: Yes
- **Request**: URL parameter `id`, form field `_method=DELETE`
- **Response** (302): Redirect to `/listings` with success message
- **Errors**:
  - 401: Not authenticated
  - 403: User is not the listing owner
  - 404: Listing not found
  - 500: Database error

---

### Reviews Endpoints

#### POST `/listings/:id/reviews`
- **Description**: Create review for a listing
- **Auth Required**: Yes
- **Request**:
  ```javascript
  {
    review: {
      rating: number (1-5, required),
      comment: string (required)
    }
  }
  ```
- **Response** (302): Redirect to `/listings/:id` with success message
- **Errors**:
  - 400: Validation failed (invalid rating or missing comment)
  - 401: Not authenticated
  - 404: Listing not found
  - 500: Database error

---

#### DELETE `/listings/:id/reviews/:reviewId`
- **Description**: Delete a review
- **Auth Required**: Yes
- **Request**: URL parameters `id` (listing), `reviewId` (review), form field `_method=DELETE`
- **Response** (302): Redirect to `/listings/:id` with success message
- **Errors**:
  - 401: Not authenticated
  - 403: User is not the review author
  - 404: Review or listing not found
  - 500: Database error

---

### User/Authentication Endpoints

#### GET `/signup`
- **Description**: Render user signup form page
- **Auth Required**: No
- **Request**: None
- **Response** (200 OK): HTML signup form page

---

#### POST `/signup`
- **Description**: Register new user account
- **Auth Required**: No
- **Request**:
  ```javascript
  {
    username: string (required, must be unique),
    email: string (required, valid email format),
    password: string (required, min 6 characters)
  }
  ```
- **Response** (302): Auto-login and redirect to `/listings` with success message
- **Errors**:
  - 400: Username already exists or validation failed
  - 500: Database error

---

#### GET `/login`
- **Description**: Render user login form page
- **Auth Required**: No
- **Request**: None
- **Response** (200 OK): HTML login form page

---

#### POST `/login`
- **Description**: Authenticate and login user
- **Auth Required**: No
- **Request**:
  ```javascript
  {
    username: string (required),
    password: string (required)
  }
  ```
- **Response** (302): Redirect to `/listings` or original requested page with success message
- **Errors**:
  - 401: Invalid username or password, redirect to `/login` with error message
  - 500: Authentication error

---

#### GET `/logout`
- **Description**: Logout current user and destroy session
- **Auth Required**: Yes
- **Request**: None
- **Response** (302): Redirect to `/listings` with logout message
- **Errors**:
  - 401: Not authenticated
  - 500: Session/logout error

---

### Root Endpoint

#### GET `/`
- **Description**: Redirect to listings page
- **Auth Required**: No
- **Request**: None
- **Response** (302): Redirect to `/listings`

---

### General Status Codes Reference

| Code | Meaning | Common Triggers |
|------|---------|-----------------|
| **2xx Success** |
| 200 | OK | GET requests successful |
| 302 | Found (Redirect) | POST/PUT/DELETE successful, redirects to new page |
| **4xx Client Error** |
| 400 | Bad Request | Validation failed, missing required fields |
| 401 | Unauthorized | Not authenticated, need to login |
| 403 | Forbidden | Authenticated but not authorized (not owner/author) |
| 404 | Not Found | Resource doesn't exist, page not found |
| **5xx Server Error** |
| 500 | Internal Server Error | Database error, Cloudinary error, server exception |

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=production
ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/StayEase
SECRET=your_secret_key_here
MAP_TOKEN=your_mapbox_token
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StayEase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Create `.env` file with required variables (see above)

4. **Create MongoDB Atlas account**
   - Set up a MongoDB Atlas cluster
   - Update `ATLASDB_URL` in `.env`

5. **Setup Cloudinary account**
   - Create a Cloudinary account for image storage
   - Update `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` in `.env`

6. **Setup Mapbox account**
   - Create a Mapbox account
   - Update `MAP_TOKEN` in `.env`

## 🎯 Running the Application

### Development Mode (with nodemon)
```bash
nodemon app.js
```

### Production Mode
```bash
node app.js
```

The application will start on `http://localhost:8080`

## 🔍 Key Features Explained

### Authentication Flow
- Users can sign up with username, email, and password
- Passwords are securely hashed using passport-local-mongoose
- Session management keeps users logged in across requests
- Logout clears the session

### Listing Creation
- Only authenticated users can create listings
- Supports image upload to Cloudinary
- Automatic geolocation using Mapbox API
- Listing owner information is automatically captured

### Reviews System
- Users can leave reviews on listings with ratings
- Only authenticated users can post reviews
- Review author can delete their own reviews
- Reviews are populated when viewing a listing

### Authorization
- Middleware checks if user is logged in for protected routes
- Owner verification ensures only listing owners can edit/delete listings
- Review author verification for review deletion

## 🛡️ Middleware

### Custom Middleware (in middleware.js)
- `isLoggedIn` - Verify user is authenticated
- `isOwner` - Verify user is listing owner
- `isReviewAuthor` - Verify user is review author
- `validateListing` - Validate listing data using Joi
- `validateReview` - Validate review data using Joi
- `saveRedirectUrl` - Save redirect URL for post-login navigation

## 📝 Models

### User Model
- Username (unique)
- Email
- Password (hashed)
- Authentication fields managed by Passport

### Listing Model
- Title
- Description
- Price
- Location
- Country
- Image (stored in Cloudinary)
- Owner (reference to User)
- Reviews (array of Review references)
- Geometry (Mapbox coordinates)

### Review Model
- Rating
- Comment
- Author (reference to User)
- Related Listing (reference to Listing)

## 🚨 Error Handling

- Custom `ExpressError` class for consistent error responses
- `WrapAsync` utility to catch async errors in route handlers
- Centralized error handling middleware at bottom of app.js
- Flash messages display user-friendly error and success messages

## 🎨 Frontend Features

- Responsive Bootstrap layout
- EJS templating with shared layouts
- Rating display component
- Interactive Mapbox integration
- Flash message notifications
- Form validation and feedback

## 📄 License

ISC

## 👤 Author

Alok Kumar

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Hosting! 🏡**
