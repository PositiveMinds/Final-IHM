# IHM2 - Integrated Healthcare Management System

A comprehensive healthcare management platform designed for HIV/AIDS and NCD (Non-Communicable Disease) management in resource-limited settings, with a focus on Western Uganda.

## Overview

IHM2 is a web-based healthcare information system that integrates patient management, appointment scheduling, clinical decision support via AI chatbot, and data analytics. The system is built with responsive web technologies and integrates with Supabase for data storage and N8N for workflow automation.

## Key Features

### 1. **Patient Management**
- Patient registration and profile management
- HIV status tracking
- Demographic data collection
- Patient type classification (ART patients, TB, NCD, etc.)
- Facility assignment

### 2. **Appointment Scheduling**
- Appointment booking and management
- Appointment type categorization (Clinical, Lab, Counseling, etc.)
- Facility-based appointment tracking
- Appointment status monitoring

### 3. **Clinical Features**
- Clinical note documentation
- Viral load tracking (HIV patients)
- Last viral load date monitoring
- Patient health history

### 4. **AI-Powered Chatbot**
- HIV/AIDS management guidance
- NCD (diabetes, hypertension, etc.) queries
- Quick reference database
- Natural language processing via Gemini API

### 5. **Admin Dashboard**
- Real-time statistics
- Patient analytics
- Appointment management
- Facility management
- Sidebar navigation with role-based access
- Responsive design for mobile and desktop

### 6. **Data Import & Export**
- Bulk patient data import via CSV
- Appointment data import
- Facility data management
- SQL batch operations

## Technology Stack

### Frontend
- **HTML5/CSS3** - Semantic markup and styling
- **JavaScript (Vanilla)** - No framework dependencies
- **Bootstrap 5** - Responsive UI framework
- **Responsive CSS** - Mobile-first design

### Backend & Database
- **Supabase** - PostgreSQL database with REST API
- **Edge Functions** - Server-side logic
- **CORS Configuration** - Cross-origin request handling

### Integrations
- **N8N** - Workflow automation
- **Gemini API** - AI chatbot intelligence
- **Supabase RLS** - Row-level security for data privacy

## Project Structure

```
IHM2/
├── index.html              # Landing page
├── login.html              # User authentication
├── forms.html              # Patient/appointment forms
├── admin-dashboard.html    # Admin panel
├── dashboard.html          # Secondary dashboard
├── styles.css              # Main stylesheet
├── script.js               # Core functionality
├── chatbot-handler.js      # AI chatbot logic
├── supabase-config.js      # Supabase initialization
├── n8n_gemini_response_parser.js  # N8N integration
├── assets/                 # Images and static files
├── logo/                   # Brand assets
├── SQL scripts/            # Database setup files
└── Documentation/          # Implementation guides
```

## Setup & Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account (free tier available)
- N8N instance (optional, for workflow automation)
- Gemini API key (for chatbot functionality)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/PositiveMinds/IHM2.git
   cd IHM2
   ```

2. **Configure Supabase**
   - Update `supabase-config.js` with your Supabase URL and API key
   - Run SQL scripts from the `SQL scripts/` directory in Supabase
   - Set up Row-Level Security (RLS) policies

3. **Configure AI Chatbot**
   - Obtain a Gemini API key from Google Cloud
   - Update the chatbot handler with your API credentials
   - Configure N8N workflows for data processing

4. **Deploy**
   - Upload files to your web server or cloud hosting
   - Ensure CORS is properly configured for Supabase
   - Test database connectivity

## Database Schema

### Core Tables
- **patients** - Patient records with demographics and health status
- **facilities** - Healthcare facility information
- **appointments** - Appointment scheduling and tracking
- **clinical_notes** - Patient clinical documentation

### Key Fields
- `patient_id` - Unique patient identifier
- `hiv_status` - HIV status indicator
- `last_viral_load_date` - Last viral load test date
- `patient_type` - Category (ART, TB, NCD, etc.)
- `appointment_type` - Type of appointment
- `facility_id` - Associated facility

## API Endpoints

### Patient Management
- `GET /rest/v1/patients` - List patients
- `POST /rest/v1/patients` - Create patient
- `PUT /rest/v1/patients/{id}` - Update patient

### Appointments
- `GET /rest/v1/appointments` - List appointments
- `POST /rest/v1/appointments` - Create appointment
- `PUT /rest/v1/appointments/{id}` - Update appointment

### Chatbot
- Integration via N8N workflow
- Gemini API for NLP processing
- Real-time response handling

## Documentation

Comprehensive guides are included:
- **CHATBOT_SETUP_GUIDE.md** - AI chatbot configuration
- **DATA_IMPORT_GUIDE.md** - Bulk data import procedures
- **CORS_FIX_GUIDE.md** - CORS configuration troubleshooting
- **N8N_SUPABASE_QUICK_START.md** - Workflow automation setup
- **DASHBOARD_ENHANCEMENTS_GUIDE.md** - UI customization

## Security Considerations

⚠️ **Important:**
- Supabase credentials in this repository are for demonstration
- **Never commit production credentials** to version control
- Use environment variables for sensitive data
- Implement proper Row-Level Security (RLS) policies
- Validate all user inputs server-side
- Enable HTTPS in production
- Regularly audit database access logs

## Features in Development

- [ ] Mobile app version
- [ ] Offline-first synchronization
- [ ] Advanced reporting and analytics
- [ ] Integration with national health systems
- [ ] Multi-language support
- [ ] SMS/WhatsApp notifications
- [ ] Video consultation module

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/improvement`)
5. Create Pull Request

## License

This project is developed for healthcare organizations in Uganda and supported by PositiveMinds.

## Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Built for HIV/AIDS and NCD management in Western Uganda
- Designed for resource-limited healthcare settings
- Community-driven healthcare automation

---

**Project Status:** Active Development
**Last Updated:** January 2026
