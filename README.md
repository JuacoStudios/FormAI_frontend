# Frontend - Gym Equipment Analysis

React Native/Expo frontend for analyzing gym equipment from images using the backend API.

## Features

- Camera integration for capturing gym equipment images
- Real-time image analysis via backend API
- Modern UI with blur effects and smooth animations
- Cross-platform support (iOS, Android, Web)

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- Backend server running on `https://formai-backend-dc3u.onrender.com`

### Installation

```bash
cd frontend/project
npm install
```

### Configuration

The app uses Expo's configuration system. The backend URL is configured in `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "https://formai-backend-dc3u.onrender.com/api"
    }
  }
}
```

### Development

```bash
cd frontend/project
npm run dev
```

## Architecture

### File Structure

```
frontend/project/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx          # Main camera screen
│   ├── config.ts              # Configuration management
│   └── app.json               # Expo configuration
├── assets/
│   └── images/                # App icons and images
└── hooks/
    └── useFrameworkReady.ts   # Framework initialization
```

### API Integration

The frontend communicates with the backend via:

- **Endpoint**: `POST /api/analyze`
- **Content-Type**: `multipart/form-data`
- **Body**: `image` (file)

### Configuration

The app uses the following environment variables:

- `EXPO_PUBLIC_API_BASE_URL`: Backend API base URL (default: `https://formai-backend-dc3u.onrender.com/api`)

## Usage

1. **Camera Access**: Grant camera permissions when prompted
2. **Capture Image**: Tap the camera button to capture an image
3. **Analysis**: The image is sent to the backend for analysis
4. **Results**: View the equipment analysis results

## Development Notes

### Backend Integration

The frontend now uses the backend API instead of calling OpenAI directly:

```typescript
// Old: Direct OpenAI call
const response = await fetch(openaiUrl, {
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify(openaiPayload)
});

// New: Backend API call
const formData = new FormData();
formData.append('image', imageFile);
const response = await fetch(`${backendUrl}/analyze`, {
  method: 'POST',
  body: formData
});
```

### Error Handling

The app includes comprehensive error handling for:
- Camera permission denials
- Network errors
- Invalid image formats
- Backend service unavailability

## Deployment

### Production Configuration

For production deployment, update the backend URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "https://formai-backend-dc3u.onrender.com/api"
    }
  }
}
```

### Build Commands

```bash
# Build for web
npm run build:web

# Build for iOS/Android
expo build:ios
expo build:android
```

## Troubleshooting

### Common Issues

1. **Backend Connection Error**: Ensure the backend server is running on the correct URL
2. **Camera Permission**: Check device settings for camera permissions
3. **Image Upload Failures**: Verify image format and size limits

### Debug Mode

Enable debug logging by checking the console output for:
- Configuration validation
- API request/response details
- Error messages
- Request URL being used (🌐 Making request to: ...)

## Future Enhancements

- Offline mode with cached results
- Image preprocessing and optimization
- User authentication
- Analysis history
- Social sharing features 