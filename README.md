# Data Job Portal

A modern job portal platform specifically designed for data-related roles (Data Scientists, Data Analysts, Data Engineers, ML Engineers, etc.). Built with React frontend, Node.js/Express backend, and Supabase database.

## 🚀 Features

- **Job Search & Filtering**: Advanced filtering by location, experience, salary, schedule, and employment type
- **Time-based Sorting**: Filter jobs by Latest, Last 24 hours, Last week, Last month
- **Company Job Posting**: Easy job posting interface for companies with automatic URL parsing
- **Live Messages**: Real-time messaging between users
- **Community**: Connect with professionals and share job opportunities
- **User Profiles**: Complete user profiles with contact information
- **Authentication**: Secure login/signup with email or phone
- **Online Users**: Live count of online users
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **PWA Support**: Installable as a Progressive Web App

## 🛠️ Tech Stack

### Frontend
- React 18.2.0
- CSS3 (Flexbox, Grid, Animations)
- Bootstrap Icons
- Axios for API calls

### Backend
- Node.js
- Express.js
- Supabase (Database & Authentication)
- JWT for authentication
- bcryptjs for password hashing

### External APIs
- RapidAPI (Job Search & Internships)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account (for database)
- RapidAPI account (optional, for external job data)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/data-job-portal.git
   cd data-job-portal
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create `.env` in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_RAPIDAPI_KEY=your_rapidapi_key
   REACT_APP_RAPIDAPI_APP=your_rapidapi_app
   ```

   Create `backend/.env`:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   RAPIDAPI_KEY=your_rapidapi_key
   RAPIDAPI_HOST=rapidapi.com
   RAPIDAPI_APP=your_rapidapi_app
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

5. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `SUPABASE_SETUP.md` (if available)
   - Get your URL and keys from Supabase dashboard

## 🚀 Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend** (in a new terminal)
   ```bash
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Production Build

```bash
npm run build
```

## 🧪 Testing

### Run all tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test

# API connection test
npm run test-api
```

### Fix errors automatically
```bash
npm run fix-errors
```

## 📁 Project Structure

```
data-job-portal/
├── src/
│   ├── components/      # React components
│   ├── lib/            # API clients and utilities
│   ├── utils/          # Helper functions
│   ├── data/           # Sample data
│   └── __tests__/      # Test files
├── backend/
│   ├── routes/         # API routes
│   ├── __tests__/      # Backend tests
│   └── server.js       # Express server
├── public/             # Static assets
└── package.json        # Frontend dependencies
```

## 🔌 API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### RapidAPI Integration
- `GET /api/rapidapi/jobs/search` - Search jobs via RapidAPI
- `GET /api/rapidapi/internships/data-roles` - Get data internships

### Other
- `GET /api/health` - Health check
- `GET /api/online-users` - Get online users count
- `GET /api/messages` - Get messages

See `api.txt` for complete API documentation.

## 🚢 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

See `DEPLOY_VERCEL.txt` for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Bootstrap Icons for icon library
- RapidAPI for job data
- Supabase for backend infrastructure

## 📞 Support

For support, email support@datajobportal.com or open an issue in the repository.

---

**Note**: Make sure to set up your environment variables before running the application. Never commit `.env` files to version control.
