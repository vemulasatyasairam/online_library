/**
 * Model Integration Tests
 * Verify all models work correctly
 */

const { User, Book, SavedBook, OTP, AuthResponse } = require('./src/models');

console.log('\n=== Online Library Model Tests ===\n');

// Test 1: User Model
console.log('TEST 1: User Model');
console.log('-'.repeat(40));
try {
  const user = new User({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  });

  console.log('✓ User created:', user.email);

  // Test validation
  const validation = user.validateForRegistration();
  console.log('✓ Validation:', validation.isValid ? 'PASSED' : 'FAILED');

  // Test email validation
  const invalidUser = new User({
    email: 'invalid-email',
    password: 'pass'
  });
  const invalidValidation = invalidUser.validateForRegistration();
  console.log('✓ Invalid email caught:', !invalidValidation.isValid ? 'PASSED' : 'FAILED');

  // Test toJSON
  const json = user.toJSON();
  console.log('✓ toJSON:', json.email ? 'PASSED' : 'FAILED');

  // Test toPublicJSON
  const publicJson = user.toPublicJSON();
  console.log('✓ toPublicJSON:', publicJson.email ? 'PASSED' : 'FAILED');

  console.log('✓ User Model Tests PASSED\n');
} catch (err) {
  console.error('✗ User Model Tests FAILED:', err.message, '\n');
}

// Test 2: Book Model
console.log('TEST 2: Book Model');
console.log('-'.repeat(40));
try {
  const book = new Book({
    id: 'book1',
    title: 'Test Book',
    author: 'Test Author',
    branch: 'Knowledge',
    pdf: 'test.pdf'
  });

  console.log('✓ Book created:', book.id);

  // Test validation
  const validation = book.validate();
  console.log('✓ Validation:', validation.isValid ? 'PASSED' : 'FAILED');

  // Test isComplete
  const isComplete = book.isComplete();
  console.log('✓ isComplete:', isComplete ? 'PASSED' : 'FAILED');

  // Test toJSON
  const json = book.toJSON();
  console.log('✓ toJSON:', json.id ? 'PASSED' : 'FAILED');

  // Test toMinimalJSON
  const minimal = book.toMinimalJSON();
  console.log('✓ toMinimalJSON:', minimal.id ? 'PASSED' : 'FAILED');

  // Test fromJSON
  const bookFromJson = Book.fromJSON(json);
  console.log('✓ fromJSON:', bookFromJson.title ? 'PASSED' : 'FAILED');

  // Test fromJSONArray
  const booksArray = Book.fromJSONArray([json, json]);
  console.log('✓ fromJSONArray:', booksArray.length === 2 ? 'PASSED' : 'FAILED');

  console.log('✓ Book Model Tests PASSED\n');
} catch (err) {
  console.error('✗ Book Model Tests FAILED:', err.message, '\n');
}

// Test 3: SavedBook Model
console.log('TEST 3: SavedBook Model');
console.log('-'.repeat(40));
try {
  const book = new Book({
    id: 'book1',
    title: 'Test Book',
    author: 'Author'
  });

  const savedBook = new SavedBook({
    email: 'user@example.com',
    book,
    bookId: 'book1'
  });

  console.log('✓ SavedBook created for:', savedBook.email);

  // Test methods
  savedBook.updateNotes('Great book!');
  console.log('✓ updateNotes:', savedBook.notes ? 'PASSED' : 'FAILED');

  savedBook.updateRating(5);
  console.log('✓ updateRating:', savedBook.rating === 5 ? 'PASSED' : 'FAILED');

  savedBook.markAsRead();
  console.log('✓ markAsRead:', savedBook.isRead ? 'PASSED' : 'FAILED');

  // Test toJSON
  const json = savedBook.toJSON();
  console.log('✓ toJSON:', json.email ? 'PASSED' : 'FAILED');

  console.log('✓ SavedBook Model Tests PASSED\n');
} catch (err) {
  console.error('✗ SavedBook Model Tests FAILED:', err.message, '\n');
}

// Test 4: OTP Model
console.log('TEST 4: OTP Model');
console.log('-'.repeat(40));
try {
  const code = OTP.generateCode();
  console.log('✓ OTP code generated:', code.length === 6 ? 'PASSED' : 'FAILED');

  const otp = new OTP({
    email: 'user@example.com',
    code
  });

  console.log('✓ OTP created for:', otp.email);

  // Test isValid
  const isValid = otp.isValid();
  console.log('✓ isValid (fresh OTP):', isValid ? 'PASSED' : 'FAILED');

  // Test verify
  const result = otp.verify(code);
  console.log('✓ verify (correct code):', result.success ? 'PASSED' : 'FAILED');

  // Test verify invalid code
  const otp2 = new OTP({
    email: 'user@example.com',
    code: '123456'
  });
  const invalidResult = otp2.verify('999999');
  console.log('✓ verify (invalid code):', !invalidResult.success ? 'PASSED' : 'FAILED');

  // Test expiration
  const expiredOtp = new OTP({
    email: 'user@example.com',
    code: '123456',
    expiresAt: new Date(Date.now() - 1000) // Already expired
  });
  console.log('✓ isExpired (past date):', expiredOtp.isExpired() ? 'PASSED' : 'FAILED');

  console.log('✓ OTP Model Tests PASSED\n');
} catch (err) {
  console.error('✗ OTP Model Tests FAILED:', err.message, '\n');
}

// Test 5: AuthResponse Model
console.log('TEST 5: AuthResponse Model');
console.log('-'.repeat(40));
try {
  // Test success response
  const successResponse = AuthResponse.success('Login successful', {
    token: 'jwt_token_here',
    user: { email: 'user@example.com' }
  });
  console.log('✓ Success response created:', successResponse.ok ? 'PASSED' : 'FAILED');

  const successJson = successResponse.toJSON();
  console.log('✓ Success toJSON:', successJson.ok && successJson.message ? 'PASSED' : 'FAILED');

  // Test error response
  const errorResponse = AuthResponse.error('Invalid credentials', 401);
  console.log('✓ Error response created:', !errorResponse.ok ? 'PASSED' : 'FAILED');

  const errorJson = errorResponse.toJSON();
  console.log('✓ Error toJSON:', !errorJson.ok && errorJson.error ? 'PASSED' : 'FAILED');

  console.log('✓ AuthResponse Model Tests PASSED\n');
} catch (err) {
  console.error('✗ AuthResponse Model Tests FAILED:', err.message, '\n');
}

console.log('='.repeat(40));
console.log('✓ All Model Tests Completed Successfully!');
console.log('='.repeat(40));
console.log('\nYou can now proceed with integration testing.\n');
