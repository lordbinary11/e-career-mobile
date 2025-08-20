# ECareerGuide Mobile App

A React Native mobile application for career guidance and counseling, connected to a PHP backend.

## Features

- **User Authentication**: Login/Register for students and counselors
- **AI Career Assistant**: Chat with AI for career guidance
- **Counselor Management**: Browse and connect with career counselors
- **Meeting Scheduling**: Schedule virtual meetings with counselors
- **Messaging System**: Direct messaging with counselors
- **Profile Management**: Update user profiles and preferences
- **Resume Builder**: Create and optimize professional resumes
- **Learning Journey**: Track career development progress

## Tech Stack

### Frontend
- **React Native** with **Expo**
- **Expo Router** for navigation
- **Axios** for API communication
- **AsyncStorage** for local data persistence
- **Ionicons** for UI icons

### Backend
- **PHP** with **PDO** for database operations
- **MySQL** database
- **JWT** for authentication
- **OpenRouter AI** for AI chat functionality

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- PHP (v7.4 or higher)
- MySQL (v5.7 or higher)
- XAMPP, WAMP, or similar local server

## Setup Instructions

### 1. Backend Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Database Setup**:
   - Create a MySQL database named `ecareer_guidance`
   - Import the database schema (create tables for users, counselors, meetings, etc.)
   - Update database credentials in `db_connect.php`:
     ```php
     $host = 'localhost';
     $dbname = 'ecareer_guidance';
     $username = 'your_username';
     $password = 'your_password';
     ```

4. **Configure API Keys**:
   - Update the OpenRouter API key in `api/ask-ai.php`
   - Configure JWT secret in `api/jwt_helper.php`

5. **Start the local server**:
   - Place the backend folder in your web server directory (e.g., `htdocs` for XAMPP)
   - Access via `http://localhost/backend/api/`

### 2. Frontend Setup

1. **Navigate to the mobile app directory**:
   ```bash
   cd ECareerGuideMobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Base URL**:
   - Open `config/api.js`
   - Update the development baseURL to match your backend:
     ```javascript
     development: {
       baseURL: 'http://your-local-ip:port/backend/api',
       timeout: 10000,
     }
     ```
   - For physical device testing, use your computer's IP address instead of localhost

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Run on device/emulator**:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app for physical device

## API Configuration

### Environment Setup

The app uses environment-based configuration. Update `config/api.js` for different environments:

```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost/backend/api',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://your-production-domain.com/backend/api',
    timeout: 15000,
  },
};
```

### Available Endpoints

- **Authentication**: `/login.php`, `/register.php`
- **Profile**: `/profile.php`
- **Counselors**: `/get_counselors.php`, `/get_counselor.php`
- **Meetings**: `/schedule_meeting.php`, `/get_meeting_details.php`
- **Messaging**: `/send_message.php`, `/get_messages.php`
- **AI Chat**: `/ask-ai.php`
- **Resume**: `/resume.php`, `/skills.php`, `/interests.php`

## Usage

### Authentication Flow

1. **Registration**: Users can register as students or counselors
2. **Login**: Role-based authentication (student/counselor)
3. **Token Management**: JWT tokens stored in AsyncStorage
4. **Auto-logout**: Automatic logout on token expiration

### Key Features

#### AI Chat
- Real-time conversation with AI career assistant
- Fallback responses if API is unavailable
- Quick question suggestions

#### Counselor Management
- Browse available counselors
- Filter by specialization
- View counselor details and ratings
- Schedule meetings or send messages

#### Profile Management
- Update personal information
- Manage skills and interests
- Track learning journey

## Troubleshooting

### Common Issues

1. **API Connection Failed**:
   - Check if backend server is running
   - Verify API base URL in `config/api.js`
   - Ensure CORS headers are properly set

2. **Authentication Issues**:
   - Clear AsyncStorage and re-login
   - Check JWT token expiration
   - Verify backend authentication middleware

3. **Database Connection**:
   - Verify MySQL service is running
   - Check database credentials in `db_connect.php`
   - Ensure database tables exist

4. **Mobile Device Testing**:
   - Use computer's IP address instead of localhost
   - Ensure device and computer are on same network
   - Check firewall settings

### Debug Mode

Enable debug logging by adding console.log statements in API calls:

```javascript
try {
  const response = await authAPI.login(email, password);
  console.log('Login response:', response);
} catch (error) {
  console.error('Login error:', error);
}
```

## File Structure

```
ECareerGuideMobile/
├── app/                    # Main application screens
│   ├── index.js           # Landing page
│   ├── login.js           # Login screen
│   ├── signup.js          # Registration screen
│   ├── dashboard.js       # Main dashboard
│   ├── counselors.js      # Counselor listing
│   ├── ai-chat.js         # AI chat interface
│   └── profile.js         # User profile
├── services/              # API and storage services
│   ├── api.js            # API communication
│   └── storage.js        # Local storage management
├── config/               # Configuration files
│   └── api.js           # API endpoints and settings
├── assets/              # Static assets
└── package.json         # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Contact the development team 