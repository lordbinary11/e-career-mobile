# ECareerGuide - Comprehensive Career Guidance Platform

A full-stack career guidance platform that connects students with professional counselors, provides AI-powered career insights, and offers comprehensive career development tools.

## 🌟 Features

- **User Management**: Student registration, authentication, and profile management
- **Counselor System**: Professional counselor profiles, ratings, and availability
- **AI Career Insights**: OpenAI-powered career guidance and recommendations
- **Meeting Scheduling**: Virtual and in-person meeting booking system
- **Learning Journey Tracking**: Progress monitoring for career development
- **Document Optimization**: AI-powered resume and document improvement
- **Real-time Messaging**: Direct communication between students and counselors
- **Mobile & Web Apps**: Cross-platform applications for all devices

## 🏗️ Architecture

- **Backend**: PHP 8.1 with PostgreSQL database
- **Mobile App**: React Native with Expo
- **Web Frontend**: React with Vite
- **Deployment**: Docker containers on Render
- **Authentication**: JWT-based security
- **AI Integration**: OpenAI API for career insights

## 📁 Project Structure

```
Projects/
├── ecareerguide-backend/          # PHP Backend API
├── ECareerGuideMobile/            # React Native Mobile App
└── frontend/                      # React Web Frontend
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: PHP 8.1+, PostgreSQL 16+, Docker, Composer
- **Mobile**: Node.js 18+, Expo CLI, React Native
- **Frontend**: Node.js 18+, npm/yarn
- **Database**: PostgreSQL database (local or cloud)

## 🔧 Backend Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ecareerguide-backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env
```

### 2. Database Configuration

```bash
# Create PostgreSQL database
createdb ecareer_guidance

# Import schema
psql -d ecareer_guidance -f database_schema.sql
```

### 3. Environment Variables

Create `.env` file in the backend root:

```env
DB_HOST=localhost
DB_NAME=ecareer_guidance
DB_USER=postgres
DB_PASS=your_password
DB_PORT=5432
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Local Development with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access backend at http://localhost:8080
# Database at localhost:5432
```

### 5. Manual Setup (Alternative)

```bash
# Install PHP extensions
sudo apt-get install php8.1-pgsql php8.1-mbstring php8.1-curl

# Start Apache/PHP server
php -S localhost:8000 -t public_html/
```

## 📱 Mobile App Setup

### 1. Install Dependencies

```bash
cd ECareerGuideMobile

# Install Node.js dependencies
npm install

# Install Expo CLI globally (if not installed)
npm install -g @expo/cli
```

### 2. Environment Configuration

Update `config/api.js`:

```javascript
const BASE_URL = 'http://localhost:8080'; // Local development
// const BASE_URL = 'https://your-app.onrender.com'; // Production
```

### 3. Run the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 🌐 Web Frontend Setup

### 1. Install Dependencies

```bash
cd frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_OPENAI_API_KEY=your_openai_key
```

### 3. Run Development Server

```bash
npm run dev

# Access at http://localhost:5173
```

## 🚀 Deployment

### Backend Deployment on Render

1. **Push to GitHub**: Ensure your code is in a public GitHub repository
2. **Connect to Render**: Link your GitHub repo to Render
3. **Create Web Service**: Use the provided `render.yaml` configuration
4. **Set Environment Variables**: Configure database and API keys
5. **Deploy**: Render will automatically build and deploy your Docker container

### Mobile App Deployment

1. **Build APK/IPA**:
   ```bash
   cd ECareerGuideMobile
   expo build:android  # For Android
   expo build:ios      # For iOS
   ```

2. **Publish to Stores**: Use Expo's build service or build locally

### Web Frontend Deployment

1. **Build for Production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy**: Upload `dist/` folder to your hosting service (Netlify, Vercel, etc.)

## 📋 Requirements

### Backend Requirements

- **PHP**: 8.1 or higher
- **Extensions**: pdo_pgsql, mbstring, exif, pcntl, bcmath, gd
- **Database**: PostgreSQL 16+
- **Web Server**: Apache with mod_rewrite
- **Composer**: For dependency management

### Mobile App Requirements

- **Node.js**: 18.0.0 or higher
- **Expo CLI**: Latest version
- **React Native**: 0.79.4
- **Expo SDK**: 53.0.12

### Frontend Requirements

- **Node.js**: 18.0.0 or higher
- **React**: 18.0.0 or higher
- **Vite**: Latest version

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 10GB free space
- **Network**: Stable internet connection for API calls

## 🔑 API Endpoints

### Authentication
- `POST /api/register.php` - User registration
- `POST /api/login.php` - User login
- `POST /api/debug_login.php` - Debug login (development)

### User Management
- `GET /api/profile.php` - Get user profile
- `POST /api/profile.php` - Update user profile
- `GET /api/user-profile.php` - Get detailed user profile

### Counselor System
- `GET /api/get_counselors.php` - List all counselors
- `GET /api/get_counselor.php` - Get specific counselor
- `POST /api/counselor_profile.php` - Update counselor profile

### Career Development
- `POST /api/education.php` - Manage education history
- `POST /api/experience.php` - Manage work experience
- `POST /api/skills.php` - Manage skills
- `POST /api/interests.php` - Manage interests
- `POST /api/learning_journey.php` - Track learning progress

### AI Services
- `POST /api/ask-ai.php` - AI career guidance
- `POST /api/ai_insights.php` - AI insights generation
- `POST /api/optimize_document.php` - Document optimization

### Communication
- `POST /api/send_message.php` - Send messages
- `GET /api/get_messages.php` - Get conversation history
- `POST /api/send_reply.php` - Send replies

### Meeting Management
- `POST /api/schedule_meeting.php` - Schedule meetings
- `GET /api/get_counselor_meetings.php` - Get counselor meetings
- `POST /api/meeting_actions.php` - Meeting actions (accept/decline)
- `GET /api/get_meeting_details.php` - Get meeting details

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - Student user accounts
- **counselors** - Professional counselor profiles
- **user_education** - Educational background
- **user_experience** - Work experience
- **user_skills** - Skills and proficiency levels
- **user_interests** - Career interests
- **user_learning_journey** - Learning progress tracking
- **meetings** - Scheduled counseling sessions
- **messages** - Communication between users and counselors

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Server-side data validation
- **SQL Injection Prevention**: Prepared statements
- **Rate Limiting**: API request throttling

## 🧪 Testing

### Backend Testing

```bash
cd ecareerguide-backend

# Test database connection
php api/test_db.php

# Test authentication
php api/test-auth.php

# Test meetings
php api/test_meetings.php
```

### API Testing

Use the provided `test_api.html` file or tools like Postman to test API endpoints.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Check Apache configuration
   - Verify CORS headers are set

3. **Build Failures**
   - Ensure all dependencies are installed
   - Check PHP version compatibility
   - Verify Docker configuration

4. **Mobile App Issues**
   - Clear Expo cache: `expo r -c`
   - Check API base URL configuration
   - Verify network connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in each component folder

## 🔄 Updates and Maintenance

- **Regular Updates**: Keep dependencies updated
- **Security Patches**: Monitor for security vulnerabilities
- **Performance Monitoring**: Monitor API response times
- **Backup Strategy**: Regular database backups
- **Log Monitoring**: Monitor application logs for errors

---

**Built with ❤️ for career development and guidance**
