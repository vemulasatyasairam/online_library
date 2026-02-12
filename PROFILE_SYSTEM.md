# Profile System Documentation

## Overview
A comprehensive user profile system has been implemented for the Online Library project, featuring profile management, avatar uploads, password changes, and account deletion.

## Features

### 1. Profile Page (`profile.html`)
A dedicated profile page with the following features:

#### Profile Sidebar
- **Avatar Display**: Shows user's profile picture or initial
- **Avatar Upload**: Click "📷 Change Photo" to upload a new profile picture
- **User Statistics**:
  - Number of saved books
  - Days active (calculated from registration date)
- **Profile Status**: Active status indicator

#### Personal Information Section
- **View Mode**: Display user's name, email, join date, and last login
- **Edit Mode**: Click "✏️ Edit" to update profile information
- Fields:
  - Full Name (editable)
  - Email Address (read-only)
  - Member Since (auto-calculated)
  - Last Login (auto-tracked)

#### Security & Password Section
- Change password functionality
- Requires current password verification
- New password validation (minimum 6 characters)
- Password confirmation field

#### Account Management
- **Danger Zone**: Account deletion
- Requires double confirmation
- Removes all user data and saved books
- Irreversible action

### 2. Profile Modals (Updated)
All existing pages now have updated profile modals:
- `main.html`
- `explorer.html`
- `personal.html`
- `branch_books.html`

**Changes**:
- Removed placeholder "Edit Profile" and "Settings" buttons
- Added "View Full Profile" button that redirects to `profile.html`
- Streamlined logout functionality

### 3. Frontend Service (`profile-service.js`)
A comprehensive JavaScript service for profile operations:

#### Methods:
- `getProfile()`: Fetch user profile and statistics
- `updateProfile(updates)`: Update user information
- `uploadAvatar(file)`: Upload profile picture
- `changePassword(current, new)`: Change user password
- `deleteAccount()`: Delete user account
- `formatDate(dateString)`: Format dates for display
- `daysSince(dateString)`: Calculate days since a date

**Features**:
- Backend API integration
- Local storage fallback
- Automatic data synchronization
- Error handling

### 4. Backend Enhancements

#### User Model Updates (`User.js`)
- Added `avatarUrl` field for profile pictures
- Updated `toJSON()` to include avatar URL

#### User Controller (`userController.js`)
New endpoints:
- `getProfile()`: Get user profile with stats
- `updateProfile()`: Update user information
- `uploadAvatar()`: Handle avatar uploads
- `deleteAccount()`: Delete user accounts

#### Routes (`routes/users.js`)
New protected routes:
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `DELETE /api/users/account` - Delete account

#### Auth Routes (`routes/auth.js`)
New protected route:
- `POST /api/auth/change-password` - Change password

#### Auth Service (`authServiceMongo.js`)
- Added `changePassword()` method for secure password updates

#### User Service (`userService.js`)
- Updated `updateProfile()` to support avatar URLs
- Added `deleteAccount()` wrapper method

### 5. File Upload Configuration
**Multer Setup** for avatar uploads:
- Storage: `uploads/avatars/`
- File size limit: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF
- Automatic filename generation with timestamps

## Usage

### Accessing the Profile Page
1. Users must be logged in
2. Click profile icon (👤) in navigation
3. Click "View Full Profile" in modal
4. Or navigate directly to `profile.html`

### Updating Profile Information
1. Click "✏️ Edit" button
2. Modify name field
3. Click "💾 Save Changes"
4. Success message displays
5. Changes saved to both backend and localStorage

### Changing Avatar
1. Click "📷 Change Photo" button
2. Select image file (max 5MB)
3. Avatar updates immediately
4. Image stored in backend or as base64 in localStorage

### Changing Password
1. Enter current password
2. Enter new password (minimum 6 characters)
3. Confirm new password
4. Click "🔒 Change Password"
5. Requires backend connection for verification

### Deleting Account
1. Scroll to "Account Management" section
2. Click "🗑️ Delete Account" button
3. Confirm in first dialog
4. Type "DELETE" in second confirmation
5. Account and all data permanently removed
6. Redirected to main page

## Technical Details

### Authentication
All profile operations require:
- Valid JWT token in localStorage
- Authorization header: `Bearer <token>`
- Auth middleware protection on backend

### Data Storage
**Backend (Primary)**:
- MongoDB database
- File system for avatars
- JSON files as fallback

**Frontend (Fallback/Cache)**:
- localStorage for user data
- base64 encoding for local avatar storage
- Synchronization with backend

### API Endpoints

#### Profile Operations
```
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update profile
POST   /api/users/avatar           - Upload avatar
DELETE /api/users/account          - Delete account
POST   /api/auth/change-password   - Change password
```

### Security Features
- Password hashing with bcrypt
- JWT token validation
- File type validation for uploads
- File size limits
- Input sanitization
- CORS configuration
- Protected routes with middleware

## File Structure
```
legacy_html/
├── profile.html           # Main profile page
└── profile-service.js     # Frontend service

backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js      # Added changePassword
│   │   └── userController.js      # Added profile methods
│   ├── models/
│   │   └── User.js                # Added avatarUrl field
│   ├── routes/
│   │   ├── auth.js                # Added change-password route
│   │   └── users.js               # Added profile routes
│   ├── services/
│   │   ├── authServiceMongo.js    # Added changePassword
│   │   └── userService.js         # Enhanced profile methods
│   └── config/
│       └── multer.js              # File upload config
└── uploads/
    └── avatars/                    # Avatar storage
```

## Design System
The profile page follows the existing design language:
- **Colors**: Blue accent (#0b72b9), light background (#f3f6f8)
- **Typography**: System fonts with clean hierarchy
- **Components**: Cards with shadows, rounded corners
- **Interactions**: Smooth transitions, hover effects
- **Responsive**: Mobile-friendly grid layout

## Future Enhancements
Potential additions:
1. Email verification for changes
2. Two-factor authentication
3. Activity log/history
4. Profile visibility settings
5. Social media links
6. Bio/about section
7. Reading preferences
8. Notification settings
9. Theme customization
10. Export data functionality

## Troubleshooting

### Avatar Upload Issues
- Check file size (max 5MB)
- Verify file format (JPEG, PNG, GIF)
- Ensure `uploads/avatars/` directory exists
- Check server write permissions

### Password Change Fails
- Verify current password is correct
- Check new password length (min 6 chars)
- Ensure backend is running
- Check network connection

### Profile Not Loading
- Verify user is logged in
- Check localStorage for currentUser
- Ensure token is valid
- Check browser console for errors

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- multer (file uploads)
- express (routing)
- mongoose (MongoDB ODM)
