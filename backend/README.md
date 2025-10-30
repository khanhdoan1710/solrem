   # SolREM Backend API

Backend server for the SolREM sleep tracking and prediction market application.

## Features

- **User Management**: User registration, authentication, and profile management
- **Sleep Data Integration**: Garmin Connect API integration for sleep data
- **Sleep Scoring**: Research-based sleep quality scoring algorithm
- **Prediction Markets**: Solana-based prediction market infrastructure (Phase 3-4)

## Technology Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Solana Web3.js** for blockchain integration
- **Axios** for external API calls

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

4. **Garmin API Setup**
   - Register at [Garmin Developer Portal](https://developer.garmin.com/)
   - Get your Client ID and Client Secret
   - Update `GARMIN_CLIENT_ID` and `GARMIN_CLIENT_SECRET` in `.env`

5. **Start the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register-user` - Register new user
- `GET /api/auth/profile/:userId` - Get user profile
- `PUT /api/auth/preferences/:userId` - Update user preferences

### Sleep Data
- `GET /api/sleep/user/:userId/data` - Get user's sleep records
- `POST /api/sleep/sync-sleep` - Sync sleep data
- `GET /api/sleep/stats/:userId` - Get sleep statistics

### Garmin Integration
- `GET /api/garmin/auth` - Initiate Garmin OAuth
- `GET /api/garmin/callback` - Handle OAuth callback
- `POST /api/garmin/sync-sleep/:userId` - Sync Garmin sleep data

### Prediction Markets (Phase 3-4)
- `GET /api/markets/active` - Get active markets
- `POST /api/markets/create` - Create new market
- `POST /api/markets/bet` - Place bet on market

## Sleep Scoring Algorithm

The sleep scoring system is based on multiple research studies and includes:

- **REM Sleep Score** (25% weight): Optimal 20-25% of total sleep
- **Deep Sleep Score** (20% weight): Optimal 15-20% of total sleep  
- **Sleep Efficiency Score** (20% weight): Optimal 85%+ efficiency
- **Sleep Duration Score** (15% weight): Optimal 7-9 hours
- **Sleep Latency Score** (10% weight): Optimal 10-20 minutes to fall asleep
- **Wake After Sleep Onset Score** (10% weight): Minimal wake time

## Development

### Project Structure
```
backend/
├── models/          # MongoDB models
├── routes/          # API route handlers
├── services/        # Business logic services
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Testing
```bash
npm test
```

## Environment Variables

See `.env.example` for required environment variables.

## Next Steps

- [ ] Implement actual Garmin API integration
- [ ] Add CUDIS and Whoop integrations
- [ ] Develop Solana smart contracts for prediction markets
- [ ] Implement in-app wallet functionality
- [ ] Add comprehensive testing suite
