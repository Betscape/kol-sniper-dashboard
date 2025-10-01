# KOL Sniper Dashboard

The Ultimate Copytrading Hub for Solana Meme Coins

## Overview

KOL Sniper Dashboard is a professional, real-time web application designed exclusively for copytraders in the Solana meme coin ecosystem. It aggregates, analyzes, and visualizes KOL (Key Opinion Leader) buying/selling activities to provide actionable intelligence for copytraders.

## Features

- **Real-time KOL Activity Feed**: Live updates on KOL buying/selling activities
- **KOL Leaderboard**: Performance metrics and momentum scoring
- **Token Analytics**: Detailed token information with KOL involvement
- **Copytrade Simulator**: Backtest following specific KOLs
- **User Authentication**: Secure signup/signin with user preferences
- **Responsive Design**: Mobile-first design for on-the-go trading

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kol-sniper-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol-sniper-dashboard
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Data Refresh

The application automatically refreshes data every 5 minutes via Vercel cron jobs. You can also manually trigger a refresh by calling:

```bash
curl -X POST http://localhost:3000/api/refresh-data
```

## API Endpoints

- `GET /api/tokens` - Fetch tokens with pagination and filtering
- `GET /api/tokens/[tokenAddress]` - Get specific token details
- `GET /api/kols` - Fetch KOLs with sorting and filtering
- `POST /api/refresh-data` - Manually refresh data from external API
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User authentication

## Database Schema

### Token
- Basic token information (name, symbol, supply, etc.)
- KOL activity metrics
- Computed fields (momentum score, average PNL)

### GlobalKOL
- Aggregated KOL performance across all tokens
- Momentum scoring and win rates
- Trading statistics

### User
- User authentication and preferences
- Followed KOLs and alert settings
- Simulation history

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

The application will automatically set up cron jobs for data refresh.

### Environment Variables for Production

Make sure to set these in your Vercel environment:

- `MONGODB_URI`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Advanced charting and analytics
- [ ] Push notifications
- [ ] Mobile app
- [ ] Premium features
- [ ] Social features (KOL following, comments)
- [ ] Advanced simulation strategies
- [ ] Portfolio tracking
- [ ] Alert system enhancements