# 🚨 Incident Radar

> **A lightweight, modern incident management system designed for small to medium-sized teams who need powerful tracking without enterprise complexity.**

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Impact & Use Cases](#-impact--use-cases)
- [Why Not Jira?](#-why-not-jira)
- [Architecture Overview](#-architecture-overview)
- [Frontend Capabilities](#-frontend-capabilities)
- [Backend Capabilities](#-backend-capabilities)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)

---

## 🎯 Problem Statement

Small startups and growing teams face a critical challenge: **they need to track and manage incidents effectively, but enterprise solutions like Jira are overkill**—too expensive, too complex, and packed with features they'll never use.

### The Real-World Problem:

- **Cost Barrier**: Enterprise incident management tools cost $7-14+ per user/month, which adds up quickly for small teams
- **Feature Overload**: Teams waste time navigating complex interfaces instead of focusing on resolving issues
- **Lack of Transparency**: Team members can't easily see who's working on what, who resolved issues, or the history of changes
- **Poor Collaboration**: No clear visibility into team activities, making it hard to coordinate efforts
- **No Activity Tracking**: Missing comprehensive audit trails showing who did what and when

### When This Problem Hits Hard:

- **Tech Startups**: Small engineering teams managing production incidents
- **DevOps Teams**: Teams tracking deployment issues and system alerts
- **Support Teams**: Customer-facing teams managing bug reports and feature requests
- **Product Teams**: Early-stage products tracking issues during rapid iteration
- **Remote Teams**: Distributed teams needing clear visibility into who's handling what

---

## 💡 Impact & Use Cases

### Immediate Impact:

✅ **Cost Savings**: 100% free and open-source—no per-user licensing fees  
✅ **Faster Onboarding**: Simple, intuitive interface—team members productive in minutes, not days  
✅ **Better Collaboration**: Complete transparency—everyone sees who created, updated, and resolved incidents  
✅ **Accountability**: Full activity history ensures nothing falls through the cracks  
✅ **Scalability**: Grows with your team without becoming bloated  

### Real-World Scenarios:

**Scenario 1: Production Incident Response**
- A critical bug is discovered in production
- Team lead creates an incident with HIGH severity
- All team members see it immediately
- Status changes are tracked: OPEN → INVESTIGATING → RESOLVED
- Everyone can see who's working on it and when it was resolved
- Full activity timeline provides post-mortem insights

**Scenario 2: Feature Request Tracking**
- Product manager logs feature requests as incidents
- Development team updates status as work progresses
- Stakeholders can see real-time progress
- Activity history shows the complete journey from request to completion

**Scenario 3: Team Coordination**
- Multiple team members working on different incidents
- Clear visibility prevents duplicate work
- Activity logs show who's active and what they're working on
- Managers can track team productivity and response times

---

## 🆚 Why Not Jira?

| Aspect | Jira | Incident Radar |
|--------|------|----------------|
| **Cost** | $7.75-$14.50/user/month | **Free & Open Source** |
| **Complexity** | 50+ features, complex workflows | **Focused on incidents only** |
| **Setup Time** | Hours to days | **Minutes** |
| **Learning Curve** | Steep—requires training | **Intuitive—self-explanatory** |
| **Customization** | Overwhelming options | **Simple, sensible defaults** |
| **Team Size** | Built for large enterprises | **Perfect for 5-50 person teams** |
| **Activity Tracking** | Requires plugins/add-ons | **Built-in comprehensive tracking** |

**Bottom Line**: Jira is like buying a freight truck when you need a delivery van. Incident Radar gives you exactly what you need—nothing more, nothing less.

---

## 🏗️ Architecture Overview

Incident Radar follows a **modern, scalable architecture** with clear separation of concerns:

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │ ◄─────► │    Backend      │
│   (React)       │  HTTP   │   (Node.js)     │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │   PostgreSQL    │
                            │   (Database)    │
                            └─────────────────┘
                                      │
                            ┌─────────────────┐
                            │     Redis       │
                            │  (Sessions/     │
                            │   Queue Jobs)   │
                            └─────────────────┘
```

---

## 🎨 Frontend Capabilities

The frontend is built with **React 19** and modern UI libraries, providing a **beautiful, responsive, and intuitive user experience**.

### What the Frontend Does:

#### 1. **User Authentication & Authorization**
- Secure login/registration with JWT token management
- Session persistence across browser refreshes
- Protected routes ensuring only authenticated users access the system
- Role-based access control (ready for future expansion)

#### 2. **Incident Management Dashboard**
- **Real-time Incident List**: View all incidents with pagination, filtering, and search
- **Severity Indicators**: Color-coded badges (LOW/MEDIUM/HIGH) for quick visual scanning
- **Status Tracking**: Visual status badges (OPEN/INVESTIGATING/RESOLVED) with color coding
- **Quick Actions**: Dropdown menus for editing, status updates, and viewing history

#### 3. **Comprehensive Activity Timeline**
- **Complete Activity History**: See every action taken on an incident
- **Visual Timeline**: Beautiful timeline UI showing chronological activity
- **Activity Types**:
  - 🎯 **Created**: Who opened the incident and when
  - 🔄 **Status Changed**: Who changed the status and what changed
  - ✏️ **Updated**: Who modified title, description, or severity
  - ✅ **Resolved**: Who resolved the incident and when
- **User Attribution**: Every action shows who performed it with timestamps
- **Rich Metadata**: Detailed descriptions of what changed

#### 4. **Incident Creation & Editing**
- **Intuitive Forms**: Clean, validated forms for creating incidents
- **Real-time Validation**: Immediate feedback on form errors
- **Severity Selection**: Easy dropdown for setting incident priority
- **Rich Descriptions**: Textarea for detailed incident descriptions

#### 5. **Advanced Filtering & Search**
- **Search Functionality**: Search across incident IDs, titles, severity, status, and creators
- **Status Filtering**: Filter by OPEN, INVESTIGATING, or RESOLVED
- **Severity Filtering**: Filter by LOW, MEDIUM, or HIGH
- **Pagination**: Efficient handling of large incident lists

#### 6. **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Support**: Built-in theme switching (ready for implementation)
- **Accessible Components**: Built on Radix UI for full accessibility
- **Smooth Animations**: Polished interactions and transitions
- **Toast Notifications**: Real-time feedback for all actions

#### 7. **State Management**
- **React Context**: Centralized authentication state
- **Optimistic Updates**: Immediate UI updates for better perceived performance
- **Error Handling**: Graceful error messages and recovery

### Technologies Used:
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety
- **Vite**: Lightning-fast development and builds
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first styling
- **React Hook Form**: Performant form handling
- **Zod**: Schema validation
- **date-fns**: Date formatting and manipulation
- **Sonner**: Toast notifications

---

## ⚙️ Backend Capabilities

The backend is a **robust, production-ready Node.js API** built with enterprise-grade patterns and security best practices.

### What the Backend Does:

#### 1. **RESTful API Architecture**
- **Clean API Design**: RESTful endpoints following industry best practices
- **Request Validation**: Zod schema validation on all inputs
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Response Standardization**: Consistent API response format

#### 2. **Authentication & Security**
- **JWT-Based Auth**: Secure token-based authentication
- **Refresh Token Rotation**: Enhanced security with token rotation
- **Session Management**: Redis-based session storage
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **CORS & Helmet**: Security headers and cross-origin protection
- **Request ID Tracking**: Every request gets a unique ID for tracing

#### 3. **Incident Management Logic**
- **CRUD Operations**: Full create, read, update, delete for incidents
- **Status Workflow**: Enforced status transitions (OPEN → INVESTIGATING → RESOLVED)
- **Activity Logging**: Automatic logging of all incident activities
- **User Attribution**: Every action tracked with user information
- **Transaction Safety**: Database transactions ensure data consistency

#### 4. **Comprehensive Activity Tracking**
- **Activity Log System**: Dedicated `IncidentActivityLogs` table tracking:
  - Incident creation events
  - Status change events
  - Update events (title, description, severity changes)
  - Resolution events
- **Metadata Storage**: JSON metadata for rich activity context
- **Timeline Generation**: Service method to build complete activity timelines
- **User Information**: Activity logs include user names and IDs

#### 5. **Database Management**
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Robust relational database
- **Migrations**: Version-controlled database schema changes
- **Relationships**: Proper foreign keys and relationships
- **Indexing**: Optimized queries with strategic indexes

#### 6. **Background Job Processing**
- **BullMQ Integration**: Redis-based job queue
- **Audit Log Workers**: Asynchronous processing of audit events
- **Scalable Architecture**: Ready for horizontal scaling

#### 7. **Observability & Monitoring**
- **Structured Logging**: Pino logger with JSON output
- **Prometheus Metrics**: Application metrics for monitoring
- **Error Metrics**: Tracking and aggregation of errors
- **Request Logging**: Comprehensive request/response logging
- **Health Checks**: `/health` endpoint for monitoring

#### 8. **Development Experience**
- **TypeScript**: Full type safety across the codebase
- **Module-Based Architecture**: Clean separation of concerns
- **Shared Utilities**: Reusable middleware, errors, and utilities
- **Testing Infrastructure**: Jest setup for unit and integration tests
- **Docker Support**: Containerized development and production

#### 9. **API Endpoints**

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

**Incidents:**
- `GET /api/incidents` - List incidents (with filtering & pagination)
- `GET /api/incidents/:id` - Get single incident
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident
- `POST /api/incidents/:id/status` - Update incident status
- `GET /api/incidents/:id/history` - Get status change history
- `GET /api/incidents/:id/activity` - Get comprehensive activity history

### Technologies Used:
- **Node.js 20**: Latest LTS version
- **Express 5**: Modern web framework
- **TypeScript**: Full type safety
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Production-grade database
- **Redis**: Session storage and job queues
- **JWT**: Token-based authentication
- **Zod**: Runtime type validation
- **BullMQ**: Job queue management
- **Pino**: High-performance logging
- **Prometheus**: Metrics collection
- **Helmet**: Security headers
- **Docker**: Containerization

---

## ✨ Key Features

### 1. **Complete Activity Transparency**
- See who created every incident
- Track who changed statuses and when
- Know who resolved issues
- View complete timeline of all actions

### 2. **Real-Time Collaboration**
- All team members see updates instantly
- No confusion about who's working on what
- Clear ownership and accountability

### 3. **Intuitive User Interface**
- Clean, modern design
- Fast and responsive
- Mobile-friendly
- Accessible to all users

### 4. **Robust Backend**
- Secure authentication
- Scalable architecture
- Comprehensive error handling
- Production-ready

### 5. **Developer-Friendly**
- TypeScript throughout
- Well-documented code
- Modular architecture
- Easy to extend

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Validation

### Backend
- **Node.js 20** - Runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Caching & queues
- **JWT** - Authentication
- **BullMQ** - Job processing
- **Pino** - Logging

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **GitHub Actions** - CI/CD
- **Prometheus** - Monitoring
- **Grafana** - Visualization (ready)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd incident-radar
   ```

2. **Start backend services**
   ```bash
   cd backend
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Run database migrations**
   ```bash
   cd backend
   npm run dev:migrate
   ```

4. **Start backend server**
   ```bash
   cd backend
   npm run dev
   ```

5. **Start frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

---

## 📁 Project Structure

```
incident-radar/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   └── incidents/   # Incident management
│   │   ├── shared/          # Shared utilities
│   │   └── config/          # Configuration
│   ├── prisma/              # Database schema & migrations
│   └── tests/               # Test files
│
└── frontend/                # React application
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/     # Reusable components
    │   ├── lib/             # Utilities & API clients
    │   └── contexts/        # React contexts
```

---

## 📊 Impact Summary

**For Small Startups:**
- ✅ **Zero Cost**: No licensing fees, no per-user charges
- ✅ **Fast Setup**: Get running in minutes, not days
- ✅ **Team Transparency**: Everyone knows who's doing what
- ✅ **Accountability**: Complete audit trail of all actions
- ✅ **Scalable**: Grows with your team without bloat

**For HR & Management:**
- ✅ **Cost-Effective**: Saves thousands compared to enterprise solutions
- ✅ **Productivity**: Team members productive immediately
- ✅ **Visibility**: Clear insights into team activity and performance
- ✅ **Professional**: Modern, polished interface that impresses stakeholders
- ✅ **Maintainable**: Clean codebase that's easy to extend and maintain

---

## 🤝 Contributing

This is a project designed to solve real problems for real teams. Contributions, suggestions, and feedback are welcome!

---

## 📄 License

[Specify your license here]

---

**Built with ❤️ for teams who need powerful incident management without the enterprise overhead.**
