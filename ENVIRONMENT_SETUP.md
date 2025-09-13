# Environment Configuration Setup

This project now uses environment variables to configure server URLs, making it easy to switch between different environments.

## Environment Variables

### For React App (react-jeopardy/)
Create a `.env.local` file in the `react-jeopardy/` directory with:

```
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_CLIENT_URL=http://localhost:3000
```

### For Server (root directory)
Create a `.env` file in the root directory with:

```
SERVER_URL=http://localhost:3000
PRODUCTION_URL=https://your-production-domain.com
```

## Usage

### Local Development
- Default values are set to localhost URLs
- No environment files needed for basic local development

### Production Deployment
Set these environment variables in your production environment:
- `REACT_APP_SERVER_URL` - Your production server URL
- `PRODUCTION_URL` - Your production domain
- `NODE_ENV=production` - Tells the server to use production mode

### Switching Environments
You can now easily switch between environments by:
1. Setting environment variables
2. Using the npm scripts (see package.json)
3. Creating different .env files for different environments

## Files Updated
- `react-jeopardy/src/config.js` - New configuration file
- `react-jeopardy/src/AdminView.js` - Now uses config
- `react-jeopardy/src/socket.js` - Now uses config
- `client.js` - Now uses environment variables
- `server.js` - Now uses environment variables consistently
