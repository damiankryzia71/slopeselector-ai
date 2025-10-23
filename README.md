# SlopeSelector AI

A full-stack application that provides personalized ski and snowboard gear recommendations using AI. Built with React, TypeScript, FastAPI, and Google Gemini API.

## Features

- 🤖 **AI-Powered Recommendations**: Uses Google Gemini API to analyze user needs and provide personalized gear suggestions
- 🎿 **Categorized Results**: Products organized by category (Skis, Boots, Goggles, etc.)
- 📱 **Modern UI**: Snow sports themed interface with "frosty glass" effects
- 📚 **Recommendation History**: Save and revisit past recommendations
- 💾 **Persistent Data**: SQLite database for storing user history and recommendations

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend
- Python 3.10+ with FastAPI
- SQLAlchemy ORM
- SQLite database
- Google Gemini API integration

## Setup Instructions

### Prerequisites
- Python 3.10+ (backend)
- Node.js 18+ (frontend)
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   Scripts\activate
   
   # macOS/Linux
   source bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env and add your Gemini API key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Start the backend server:**
   ```bash
   python run_server.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/slopeselector
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## Usage

1. **Get Recommendations:**
   - Describe your skiing/snowboarding needs in the text area
   - Click "Get Recommendations" to receive AI-powered suggestions
   - Browse categorized products with pros, cons, and store links

2. **View History:**
   - Click the "History" tab to see past recommendations
   - Click any history item to view the full recommendation details

## API Endpoints

- `POST /api/recommendations` - Get new recommendations
- `GET /api/history/{userId}` - Get user's recommendation history
- `GET /api/recommendations/{setId}` - Get specific recommendation details

## Database Schema

The application uses SQLite with the following tables:
- `users` - User information
- `recommendation_sets` - Recommendation sessions
- `categories` - Product categories
- `products` - Individual products
- `product_details` - Product pros and cons

## Development

### Backend Development
- The backend uses FastAPI with automatic API documentation at `http://localhost:8000/docs`
- Database is automatically created on first run
- All API endpoints include proper error handling and validation

### Frontend Development
- Built with React 18+ and TypeScript
- Uses Tailwind CSS for responsive, modern styling
- Implements proper error handling and loading states
- Includes comprehensive type definitions

## Environment Variables

### Backend
- `GEMINI_API_KEY` - Your Google Gemini API key (required)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
