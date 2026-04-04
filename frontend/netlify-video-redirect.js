/**
 * INSTRUCTIONS FOR HANDLING VIDEOS WITH NETLIFY
 * 
 * Since Netlify has file size limits (especially on the free tier),
 * here are the steps to handle your video files properly:
 * 
 * 1. Upload your videos to a service like:
 *    - AWS S3
 *    - Cloudinary
 *    - Vimeo
 *    - YouTube (if embedding is preferred)
 * 
 * 2. Update the URLs in src/components/VideoPlayer.jsx with your hosted video URLs
 * 
 * 3. Make sure CORS is configured correctly on your hosting service to allow
 *    your Netlify domain to access the videos
 */

// This file serves as documentation only - no need to run it as a script 