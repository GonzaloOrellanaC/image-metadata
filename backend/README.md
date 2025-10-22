# Image Metadata Backend

Backend Node.js with TypeScript to receive an image and return ordered EXIF metadata.

Installation

1. cd backend
2. npm install
3. npm run dev

API

- POST /api/photo/metadata - multipart/form-data with field `photo` (file). Returns ordered metadata JSON.
