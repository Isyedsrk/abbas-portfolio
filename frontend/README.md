# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Portfolio Project

A personal portfolio website showcasing projects and skills.

## Deploying to Netlify

This project is configured for easy deployment to Netlify. Follow these steps:

### 1. Prepare Video Hosting

Due to Netlify's file size limits, videos need to be hosted externally:

1. Upload your video files to a service like:
   - AWS S3
   - Cloudinary
   - Vimeo
   - YouTube

2. Update the video URLs in `src/components/VideoPlayer.jsx` with your hosted video URLs.

3. Make sure CORS is configured correctly on your hosting service.

### 2. Deploy to Netlify

#### Option 1: Deploy with Netlify CLI

1. Install Netlify CLI:
   ```
   npm install netlify-cli -g
   ```

2. Build your project:
   ```
   npm run build
   ```

3. Deploy to Netlify:
   ```
   netlify deploy
   ```

4. Follow the prompts to complete the deployment.

#### Option 2: Deploy via Netlify Website

1. Push your code to a GitHub repository.

2. Go to [Netlify](https://www.netlify.com/) and login.

3. Click "New site from Git" and select your repository.

4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`

5. Click "Deploy site".

### 3. Configure Redirects

The project already includes the necessary redirect rules in `netlify.toml` and `public/_redirects` to handle React Router paths. No additional configuration is needed.

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

## Project Structure

- `src/components/` - React components
- `src/components/videos/` - Local video files (not included in Netlify deploy)
- `public/` - Static assets
