/**
 * FRONTEND-BACKEND INTEGRATION GUIDE
 * 
 * This file shows how to use the AuthService with the backend models
 * The backend uses well-structured models for all authentication and data entities
 */

// =============================================================================
// SECTION 1: AUTHENTICATION FLOWS
// =============================================================================

/**
 * REGISTRATION FLOW
 * 
 * Frontend -> AuthService -> Backend -> Models -> FileStore
 * 
 * Backend Flow:
 * 1. ValidateRegistrationData (validator)
 * 2. AuthService.register() 
 * 3. User Model creation + validation
 * 4. User.hashPassword()
 * 5. FileStore.saveUser()
 * 6. JWT token generated
 * 7. AuthResponse returned
 */

// Frontend Example
async function handleRegistration(email, password, name) {
  const result = await AuthService.register(email, password, name);
  
  if (result.ok) {
    // Store token
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('currentUser', email);
    
    // Redirect to dashboard
    location.href = 'explorer.html';
  } else {
    // Show error: result.error
    alert(result.error);
  }
}

/**
 * LOGIN FLOW
 * 
 * Frontend -> AuthService -> Backend -> Models -> FileStore
 * 
 * Backend Flow:
 * 1. ValidateLoginData (validator)
 * 2. AuthService.login()
 * 3. User Model creation + validation
 * 4. FileStore.findUserByEmail()
 * 5. User.comparePassword()
 * 6. User.updateLastLogin()
 * 7. JWT token generated
 * 8. AuthResponse returned
 */

async function handleLogin(email, password) {
  const result = await AuthService.login(email, password);
  
  if (result.ok) {
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('currentUser', email);
    location.href = 'explorer.html';
  } else {
    alert(result.error);
  }
}

/**
 * PASSWORD RESET FLOW (OTP)
 * 
 * Step 1: Send OTP
 * Frontend -> AuthService.sendOTP() -> Backend -> OTP Model Created -> FileStore
 * 
 * Step 2: Verify OTP
 * Frontend -> AuthService.verifyOTP() -> Backend -> OTP.verify() -> User.updatePassword() -> FileStore
 */

async function handlePasswordReset(email, otpCode, newPassword) {
  // Step 1: Request OTP
  const sendResult = await AuthService.sendOTP(email);
  if (!sendResult.ok) {
    console.error('Failed to send OTP:', sendResult.error);
    return;
  }
  
  // OTP sent, user enters code and new password
  // Step 2: Verify OTP
  const verifyResult = await AuthService.verifyOTP(email, otpCode, newPassword);
  if (verifyResult.ok) {
    localStorage.setItem('auth_token', verifyResult.token);
    localStorage.setItem('currentUser', email);
    location.href = 'explorer.html';
  } else {
    alert(verifyResult.error);
  }
}

// =============================================================================
// SECTION 2: USER PROFILE MANAGEMENT
// =============================================================================

/**
 * GET USER PROFILE
 * 
 * Backend Flow:
 * 1. JWT middleware validates token
 * 2. UserService.getProfile(email)
 * 3. FileStore.findUserByEmail()
 * 4. User Model instance created
 * 5. User.toJSON() returns public data
 * 6. Response sent
 */

async function loadUserProfile() {
  const result = await AuthService.getProfile();
  
  if (result.ok) {
    console.log('User Profile:', result.user);
    // User data includes:
    // - email
    // - name
    // - createdAt
    // - updatedAt
    // - isActive
    // - lastLogin
  }
}

/**
 * UPDATE USER PROFILE
 * 
 * Backend Flow:
 * 1. JWT middleware validates token
 * 2. UserService.updateProfile(email, updates)
 * 3. FileStore.findUserByEmail()
 * 4. Update User Model properties
 * 5. FileStore.saveUser()
 * 6. User.toJSON() returned
 */

async function updateUserProfile(newName) {
  const result = await AuthService.updateProfile(newName);
  
  if (result.ok) {
    console.log('Profile updated:', result.user);
  }
}

// =============================================================================
// SECTION 3: SAVED BOOKS MANAGEMENT
// =============================================================================

/**
 * GET SAVED BOOKS
 * 
 * Backend Flow:
 * 1. JWT middleware validates token
 * 2. SavedBooksService.getSavedBooks(email)
 * 3. FileStore.getSavedBooks(email)
 * 4. Book Models created from stored data
 * 5. Book.toJSON() for each book
 * 6. Array of books returned
 */

async function loadSavedBooks() {
  const result = await AuthService.getSavedBooks();
  
  if (result.ok) {
    const books = result.books;
    // Each book has:
    // - id, title, author, subject, pdf, branch
    // - coverImage, description, isbn
    // - publishedYear, pageCount, language
    
    books.forEach(book => {
      console.log(`Book: ${book.title} by ${book.author}`);
    });
  }
}

/**
 * SAVE A BOOK
 * 
 * Backend Flow:
 * 1. JWT middleware validates token
 * 2. SavedBooksService.saveBook(email, bookData)
 * 3. Book Model created + validation
 * 4. Check if already saved
 * 5. FileStore.addSavedBook()
 * 6. Success response
 */

async function saveBook(bookObject) {
  // bookObject should have: id, title, author, etc.
  const result = await AuthService.saveBook(bookObject);
  
  if (result.ok) {
    alert('Book saved successfully!');
  } else {
    alert(result.error);
  }
}

/**
 * REMOVE SAVED BOOK
 * 
 * Backend Flow:
 * 1. JWT middleware validates token
 * 2. SavedBooksService.removeBook(email, bookId)
 * 3. FileStore.removeSavedBook()
 * 4. Success response
 */

async function removeBook(bookId) {
  const result = await AuthService.removeBook(bookId);
  
  if (result.ok) {
    alert('Book removed!');
  }
}

// =============================================================================
// SECTION 4: ERROR HANDLING & STATUS CHECKS
// =============================================================================

/**
 * CHECK IF USER IS LOGGED IN
 * Checks if token exists in localStorage
 */
function checkLoginStatus() {
  if (AuthService.isLoggedIn()) {
    console.log('User is logged in:', AuthService.getCurrentUser());
    return true;
  } else {
    console.log('User not logged in');
    return false;
  }
}

/**
 * LOGOUT
 * Clear token and user data
 */
function handleLogout() {
  AuthService.logout();
  localStorage.clear();
  location.href = 'login.html';
}

/**
 * ERROR HANDLING PATTERNS
 */

async function exampleErrorHandling() {
  try {
    const result = await AuthService.login(email, password);
    
    if (!result.ok) {
      // Error response from backend
      const errorMessage = result.error;
      console.error('Login failed:', errorMessage);
      
      // Common error messages:
      // - "Invalid email or password" (401)
      // - "User already exists" (409)
      // - "Valid email is required" (400)
      // - "Password must be at least 6 characters" (400)
    }
  } catch (err) {
    // Network error
    console.error('Network error:', err);
  }
}

// =============================================================================
// SECTION 5: PROTECTED PAGE FLOW
// =============================================================================

/**
 * AUTO-REDIRECT ON PROTECTED PAGES
 * 
 * The script.js handles this automatically:
 * 1. Check if page requires authentication (explorer.html, personal.html)
 * 2. Check AuthService.isLoggedIn()
 * 3. If not logged in, redirect to login.html with ?next= parameter
 * 4. After login, redirect to original page
 */

// Manual implementation if needed:
function protectPage() {
  if (!AuthService.isLoggedIn()) {
    const nextPage = encodeURIComponent(window.location.pathname);
    window.location.href = `login.html?next=${nextPage}`;
  }
}

// =============================================================================
// SECTION 6: COMPLETE WORKFLOW EXAMPLE
// =============================================================================

/**
 * COMPLETE USER JOURNEY
 */

// 1. User opens login page
// 2. Fills registration form
async function userRegisters() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;
  
  const result = await AuthService.register(email, password, name);
  if (result.ok) {
    // User is now logged in, token stored
    // Can access protected pages
  }
}

// 3. User navigates to explorer
// 4. Sees books and clicks save
async function userSavesBook() {
  const book = {
    id: 'book1',
    title: 'IAS General Studies',
    author: 'A. Sharma',
    subject: 'Competitive Exams',
    pdf: 'pdfs/ias.pdf',
    branch: 'Knowledge'
  };
  
  await AuthService.saveBook(book);
}

// 5. User views saved books in personal page
async function userViewsSavedBooks() {
  const result = await AuthService.getSavedBooks();
  if (result.ok) {
    const savedBooks = result.books;
    // Display books to user
  }
}

// 6. User updates profile
async function userUpdatesProfile() {
  await AuthService.updateProfile('New Name');
}

// 7. User forgets password and resets it
async function userResetsPassword() {
  const email = 'user@example.com';
  
  // Request OTP
  await AuthService.sendOTP(email);
  
  // User receives OTP (in dev mode, shown on screen)
  // User enters OTP and new password
  const otp = '123456';
  const newPassword = 'newpassword123';
  
  await AuthService.verifyOTP(email, otp, newPassword);
}

// 8. User logs out
function userLogout() {
  AuthService.logout();
}

// =============================================================================
// SECTION 7: INTEGRATION CHECKLIST
// =============================================================================

/*
✓ Backend Models Created:
  - User (authentication, validation, password hashing)
  - Book (library catalog representation)
  - SavedBook (user's saved books with metadata)
  - OTP (password reset mechanism)
  - AuthResponse (standardized responses)

✓ Backend Services Created:
  - AuthService (registration, login, OTP)
  - UserService (profile management)
  - SavedBooksService (book management)

✓ Backend Validators Created:
  - Email validation
  - Password validation
  - Registration data validation
  - Login data validation
  - OTP data validation

✓ Frontend AuthService Created:
  - login(), register(), sendOTP(), verifyOTP()
  - getProfile(), updateProfile()
  - getSavedBooks(), saveBook(), removeBook()
  - isLoggedIn(), getCurrentUser(), logout()

✓ HTML Pages Updated:
  - login.html (with tabs for login/register)
  - index.html (with logout handler)
  - personal.html (includes auth-service)

✓ Data Storage:
  - users.json (stores user accounts with hashed passwords)
  - saved.json (stores user's saved books)
  - otp.json (stores temporary OTP codes)

Next Steps:
1. Run: npm install (to ensure all dependencies)
2. Run: npm start (to start backend server)
3. Open: login.html in browser
4. Test: Registration flow
5. Test: Login flow
6. Test: Save books
7. Test: Password reset

For Production:
1. Move to real database (MongoDB/PostgreSQL)
2. Implement email sending for OTPs
3. Add rate limiting
4. Add CSRF protection
5. Use HTTPS only
6. Update CORS settings
7. Secure JWT secret
*/

// =============================================================================
// END OF INTEGRATION GUIDE
// =============================================================================
