# AbsurdLabs Email Ecosystem

A production-ready, scalable email management system built with Next.js, MongoDB, Redis, and Google Cloud Platform.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React 19

**Backend:**
- Next.js API Routes
- MongoDB (Primary Database - NoSQL for elasticity)
- Redis (Caching & Session Management)
- JWT Authentication
- bcrypt Password Hashing

**Cloud Services:**
- Google Cloud Storage (File attachments)
- Google Cloud Run (Deployment)
- MongoDB Atlas (Managed MongoDB)
- Redis Cloud (Managed Redis)

### Project Structure

```
absurdlabs/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── emails/       # Email management
│   │   ├── contacts/     # Contact management
│   │   ├── calendar/     # Calendar events
│   │   └── upload/       # File uploads
│   └── (pages)/          # Frontend pages
├── lib/                   # Core utilities
│   ├── db/               # Database connections
│   ├── auth/             # Authentication utilities
│   ├── redis/            # Redis client & caching
│   ├── storage/          # Google Cloud Storage
│   └── utils/            # Helper functions
├── models/               # MongoDB schemas
├── components/           # React components
├── types/                # TypeScript types
└── TODO.md              # Development roadmap
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB instance (local or MongoDB Atlas)
- Redis instance (local or Redis Cloud)
- Google Cloud Platform account
- SMTP server credentials (Gmail, SendGrid, etc.)

### Installation

1. **Clone and install dependencies:**

```bash
cd absurdlabs
pnpm install
```

2. **Setup environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://@cluster.mongodb.net/als

# Redis Cloud connection string
REDIS_URL=redis://@host:port

# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key

# Gmail SMTP (or your email provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Cloud Storage
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=absurdlabs-attachments
GCS_KEY_FILE=./gcp-service-account-key.json
```

3. **Setup Google Cloud Storage:**

- Create a GCP project
- Enable Cloud Storage API
- Create a storage bucket
- Create a service account with Storage Admin role
- Download the JSON key file and save as `gcp-service-account-key.json`

4. **Run development server:**

```bash
pnpm dev
```

Visit `http://localhost:3000`

## 📊 Database Schemas

### User Model
- Email/password authentication
- Email verification
- Password reset tokens
- Timestamps

### Email Model
- From/To/CC/BCC recipients
- Subject, body (text & HTML)
- Attachments (stored in GCS)
- Folders (inbox, sent, drafts, trash, custom)
- Labels/tags
- Threading support
- Read/starred/draft status
- Full-text search indexes

### Thread Model
- Groups related emails
- Tracks participants
- Email count and last activity

### Folder Model
- Custom user folders
- Color coding
- Icons

### Label Model
- Email categorization
- Color coding

### Contact Model
- Email, name, phone
- Company, job title
- Notes

### Calendar Event Model
- Title, description, location
- Start/end times
- All-day events
- Attendees
- Color coding

## 🔐 Authentication Flow

1. **Registration:**
   - User submits email/password
   - Password validated (8+ chars, uppercase, lowercase, number, special char)
   - Password hashed with bcrypt (12 rounds)
   - Verification email sent with JWT token
   - User stored in MongoDB

2. **Email Verification:**
   - User clicks link in email
   - Token verified and decoded
   - User marked as verified

3. **Login:**
   - Credentials validated
   - JWT token generated (7-day expiry)
   - Session stored in Redis
   - Token returned to client

4. **Password Reset:**
   - User requests reset
   - Reset email sent with 1-hour token
   - User submits new password
   - Password updated and tokens invalidated

## 🔧 API Endpoints (To Be Implemented)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout user

### Emails
- `GET /api/emails` - List emails (with filters)
- `GET /api/emails/:id` - Get email details
- `POST /api/emails` - Send email
- `POST /api/emails/draft` - Save draft
- `PUT /api/emails/:id` - Update email
- `DELETE /api/emails/:id` - Delete email
- `POST /api/emails/search` - Search emails

### Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Calendar
- `GET /api/calendar` - List events
- `POST /api/calendar` - Create event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

### Upload
- `POST /api/upload` - Upload file to GCS

## 🛡️ Security Features (To Be Implemented)

- **Rate Limiting:** Redis-based rate limiting (100 requests per 15 minutes)
- **CSRF Protection:** Token-based CSRF protection
- **Input Validation:** Zod schema validation
- **SQL Injection:** MongoDB parameterized queries
- **XSS Protection:** Content Security Policy headers
- **Password Security:** bcrypt with 12 rounds
- **JWT Security:** Short-lived tokens with secure secrets

## 📦 Deployment

### Google Cloud Run

1. **Build Docker image:**

```bash
docker build -t gcr.io/[PROJECT-ID]/absurdlabs .
docker push gcr.io/[PROJECT-ID]/absurdlabs
```

2. **Deploy to Cloud Run:**

```bash
gcloud run deploy absurdlabs \
  --image gcr.io/[PROJECT-ID]/absurdlabs \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="MONGODB_URI=mongodb-uri:latest,REDIS_URL=redis-url:latest,JWT_SECRET=jwt-secret:latest"
```

3. **Configure custom domain:**

```bash
gcloud run domain-mappings create \
  --service absurdlabs \
  --domain absurdlabs.io \
  --region us-central1
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📝 Development Roadmap

See [TODO.md](./TODO.md) for the complete development roadmap.

### Priority Tasks

1. **Complete Authentication APIs** - Register, login, verify, reset password endpoints
2. **Build Email Management** - Compose, send, inbox, threading APIs
3. **Frontend Development** - Authentication pages, email dashboard, compose UI
4. **Google Cloud Storage Integration** - File upload/download for attachments
5. **Security Middleware** - Rate limiting, CSRF, input validation
6. **Testing** - Unit tests, integration tests, E2E tests

## 🤝 Contributing

This is a foundation project. Continue development by:

1. Implementing API endpoints in `app/api/`
2. Creating frontend pages in `app/`
3. Building React components in `components/`
4. Adding middleware in `lib/`

## 📄 License

MIT

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Redis Cloud](https://redis.com/try-free/)
- [Google Cloud Storage](https://cloud.google.com/storage/docs)
- [Google Cloud Run](https://cloud.google.com/run/docs)

---

**Built with ❤️ for scalable email management**
