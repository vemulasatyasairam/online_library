# Avatar Uploads Directory

This directory stores user profile avatars uploaded through the profile page.

## Configuration
- Maximum file size: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF
- File naming: `avatar-{timestamp}-{random}.{ext}`

## Security
- File type validation
- Size limits enforced
- Served through Express static middleware

## Cleanup
Avatars are not automatically deleted when users change their profile picture.
Consider implementing a cleanup script for orphaned files.
