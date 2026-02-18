# AbsurdLabs Email Ecosystem - TODO

## Phase 1: Project Setup
- [x] Initialize Next.js project with TypeScript
- [x] Install core dependencies (MongoDB, Redis, Auth)
- [x] Setup project structure and folders
- [x] Create environment configuration
- [x] Setup MongoDB schemas and models
- [x] Configure Redis connection

## Phase 2: Authentication System
- [x] Build JWT authentication utilities
- [x] Create password hashing with bcrypt
- [x] Implement user registration endpoint
- [x] Implement login endpoint
- [x] Create email verification system
- [ ] Build password reset functionality (email service ready)
- [x] Add session management with Redis
- [ ] Create auth middleware for protected routes

## Phase 3: Email Management
- [ ] Design MongoDB email schema
- [ ] Create email compose API
- [ ] Implement email send functionality
- [ ] Build inbox/sent/drafts/trash folders
- [ ] Implement email threading logic
- [ ] Create email search functionality
- [ ] Build email labels system
- [ ] Add email attachments support

## Phase 4: Contacts & Calendar
- [ ] Design contacts MongoDB schema
- [ ] Create contacts CRUD APIs
- [ ] Design calendar events schema
- [ ] Build calendar event CRUD APIs
- [ ] Implement event reminders

## Phase 5: Google Cloud Integration
- [ ] Setup Google Cloud Storage client
- [ ] Create file upload API
- [ ] Implement attachment storage
- [ ] Add file download/preview

## Phase 6: Frontend Development
- [ ] Create authentication pages (login, register, verify)
- [ ] Build email dashboard layout
- [ ] Create inbox view
- [ ] Build email compose interface
- [ ] Implement email detail view with threading
- [ ] Create contacts management UI
- [ ] Build calendar interface
- [ ] Add settings page

## Phase 7: Security & Performance
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Setup security headers
- [ ] Add input validation and sanitization
- [ ] Implement Redis caching strategy
- [ ] Add error logging

## Phase 8: Deployment
- [ ] Create Dockerfile
- [ ] Setup docker-compose for local development
- [ ] Create Google Cloud Run configuration
- [ ] Write deployment documentation
- [ ] Create environment variables guide
- [ ] Add monitoring setup guide

## Phase 9: Testing & Documentation
- [ ] Write API documentation
- [ ] Create deployment guide
- [ ] Add local development setup guide
- [ ] Test authentication flow
- [ ] Test email operations
- [ ] Test contacts and calendar


## Email Management APIs (Current Focus)
- [x] Create authentication middleware for protected routes
- [x] Implement GET /api/emails - List emails with pagination and filters
- [x] Implement GET /api/emails/[id] - Get email details with thread
- [x] Implement POST /api/emails/send - Send new email
- [x] Implement POST /api/emails/draft - Save draft
- [x] Implement PUT /api/emails/[id] - Update email (read, star, folder, labels)
- [x] Implement DELETE /api/emails/[id] - Delete email (move to trash)
- [x] Implement POST /api/emails/search - Search emails with full-text
- [x] Implement GET /api/folders - List user folders
- [x] Implement POST /api/folders - Create custom folder
- [x] Implement GET /api/labels - List user labels
- [x] Implement POST /api/labels - Create custom label
- [x] Test all endpoints with curl/Postman


## Frontend UI Development (Current Focus)
- [x] Install frontend dependencies (React Query, Axios, React Router)
- [x] Create API client utilities
- [x] Build authentication context and hooks
- [x] Create login page with form validation
- [x] Create register page with form validation
- [x] Build email dashboard layout with sidebar
- [x] Create inbox view with email list
- [x] Implement pagination for email list
- [x] Build email compose modal/interface
- [x] Create email detail view with threading
- [x] Create sent/drafts/starred/trash pages
- [x] Create reusable EmailList component
- [ ] Implement folder management UI (basic display done)
- [ ] Implement label management UI (basic display done)
- [ ] Add search interface
- [ ] Test complete frontend flow
