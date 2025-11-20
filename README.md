# WindBorne Constellation Monitor

A real-time weather balloon tracking and analysis application built as part of my submission for the **Junior Web Developer** position at [WindBorne Systems](https://windbornesystems.com/).

## Project Purpose

This application was created in response to WindBorne Systems' engineering challenge, which required:
1. Querying their live constellation API (tracking thousands of weather balloons globally)
2. Combining this data with another public dataset/API
3. Building something interesting that updates dynamically with the latest 24-hour data

## What It Does

The WindBorne Constellation Monitor provides:

- **Real-time Tracking**: Displays the current position of thousands of weather balloons on an interactive global map
- **24-Hour History**: Visualizes each balloon's complete path over the past 24 hours with clickable trails
- **AI-Powered Insights**: Integrates Google's Gemini AI to provide meteorological analysis of each balloon's journey
- **Live Stats**: Shows constellation-wide metrics including total balloon count, historical data points, and average altitude
- **Dynamic Updates**: Supports manual cache refresh to fetch the latest data from WindBorne's API

## Technical Stack

### Frontend
- **React** with **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Leaflet.js** for high-performance map rendering with thousands of data points
- **Lucide React** for beautiful icons

### Backend
- **Node.js** serverless API deployed on Vercel
- **Redis** (Upstash) for intelligent caching and rate limiting
- **Axios** for robust HTTP requests with retry logic

### External APIs
- **WindBorne Systems API** (23 hours of historical balloon data)
- **Google Gemini AI** (Gemini 2.5 Flash) for journey analysis and meteorological insights

## 💡 Why This Approach?

I chose to integrate **Google's Gemini AI** as the external dataset because it adds genuine value beyond simple data visualization. Instead of just plotting coordinates, the AI provides:

- Geographical context (e.g., "over the North Atlantic," "above the Sahara Desert")
- Meteorological insights (e.g., "captured by a subtropical jet stream")
- Educational value for users interested in atmospheric science

This demonstrates not just technical implementation, but product thinking—creating an experience that's genuinely useful and educational.

## Key Features

1. **Interactive Map**
   - Click any balloon to view its 24-hour path
   - Color-coded trails (blue = active path, gray = historical breadcrumbs)
   - Zoom and pan with full mobile support

2. **AI Analysis Modal**
   - One-click journey analysis for any balloon
   - Markdown-formatted insights rendered beautifully
   - Start/end position comparison with altitude tracking

3. **Performance Optimizations**
   - Lazy loading for map components
   - Canvas rendering for thousands of markers
   - Redis caching with automatic expiration
   - Efficient data aggregation from 24 API endpoints

4. **Robust Error Handling**
   - Graceful degradation when APIs are unavailable
   - Retry logic for transient failures
   - User-friendly error messages

## 🌐 Live Demo

**[View Live Application →](https://wind-borne-constellation-monitor.vercel.app/)**

The application is deployed on Vercel with:
- Frontend: Static Vite build
- Backend: Vercel serverless functions
- Database: Redis hosted on Upstash (serverless Redis)


## What I Learned

Building this project taught me:
- Working with undocumented, live APIs and handling data inconsistencies
- Integrating AI services to add value to raw data
- Performance optimization for rendering large datasets
- Serverless architecture and Redis caching strategies
- Full-stack development from conception to deployment

## Acknowledgments

- **WindBorne Systems** for the fascinating challenge and the opportunity to work with real atmospheric data
- The open-source community for amazing tools like React, Leaflet, and Tailwind CSS

---

**Built with passion for the WindBorne Systems Junior Web Developer position** 🎈
