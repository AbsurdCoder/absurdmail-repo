# Quick Start Guide - AbsurdLabs

Get AbsurdLabs running locally in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Docker Desktop (optional, for local MongoDB/Redis)

## Option 1: Using Docker (Recommended for Quick Start)

1. **Start MongoDB and Redis:**

```bash
cd absurdlabs
docker-compose up -d
```

This starts MongoDB on port 27017 and Redis on port 6379.

2. **Create `.env` file:**

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/absurdlabs?authSource=admin
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-this
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
GCS_PROJECT_ID=your-project
GCS_BUCKET_NAME=absurdlabs-attachments
GCS_KEY_FILE=./gcp-service-account-key.json
```

3. **Install dependencies:**

```bash
pnpm install
```

4. **Run development server:**

```bash
pnpm dev
```

Visit http://localhost:3000

## Option 2: Using Cloud Services

1. **Setup MongoDB Atlas:**
   - Create free cluster at https://www.mongodb.com/cloud/atlas
   - Get connection string

2. **Setup Redis Cloud:**
   - Create free database at https://redis.com/try-free/
   - Get connection string

3. **Create `.env`:**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/absurdlabs
REDIS_URL=redis://default:pass@host:port
JWT_SECRET=$(openssl rand -base64 32)
# ... rest of config
```

4. **Install and run:**

```bash
pnpm install
pnpm dev
```

## Testing the API

### 1. Register a user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

### 2. Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

Save the returned `token`.

### 3. Access protected route:

```bash
curl -X GET http://localhost:3000/api/emails \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

1. **Implement remaining APIs** - See [API_GUIDE.md](./API_GUIDE.md)
2. **Build frontend pages** - Create React components in `app/` and `components/`
3. **Setup Google Cloud Storage** - For file attachments
4. **Add security middleware** - Rate limiting, CSRF protection
5. **Deploy to production** - See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Project Structure

```
absurdlabs/
├── app/
│   ├── api/              # API routes
│   │   └── auth/        # ✅ Register & Login implemented
│   └── page.tsx         # Landing page
├── lib/
│   ├── db/              # ✅ MongoDB connection
│   ├── redis/           # ✅ Redis cache
│   ├── auth/            # ✅ JWT & password utils
│   └── utils/           # ✅ Email service
├── models/              # ✅ All schemas defined
├── components/          # React components (to build)
└── TODO.md             # Development roadmap
```

## Common Issues

### MongoDB connection fails

- Check if MongoDB is running: `docker ps`
- Verify connection string in `.env`
- For Atlas: check network access allows your IP

### Redis connection fails

- Check if Redis is running: `docker ps`
- Verify connection string in `.env`
- For Redis Cloud: check endpoint and password

### Email sending fails

- For Gmail: use App Password, not regular password
- Enable "Less secure app access" or use OAuth2
- For development: emails are logged to console

## Development Workflow

1. **Create API endpoint** in `app/api/`
2. **Define Zod schema** for validation
3. **Connect to database** with `connectDB()`
4. **Use models** from `models/`
5. **Return JSON response**

Example:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = schema.parse(body);
    
    await connectDB();
    // Your logic here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## Resources

- [README.md](./README.md) - Full documentation
- [API_GUIDE.md](./API_GUIDE.md) - API implementation guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [TODO.md](./TODO.md) - Development roadmap

## Need Help?

- Check existing code in `app/api/auth/` for examples
- Review model schemas in `models/`
- See utility functions in `lib/`

---

**Happy coding! 🚀**
