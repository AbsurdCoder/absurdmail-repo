# API Development Guide

Guide for implementing the remaining API endpoints for AbsurdLabs.

## Authentication Pattern

All API routes follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// Define validation schema
const schema = z.object({
  field: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Parse and validate request
    const body = await request.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectDB();

    // 4. Perform operation
    // ... your logic here

    // 5. Return response
    return NextResponse.json({ success: true, data: {} });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Remaining Endpoints to Implement

### 1. Email Verification
**File:** `app/api/auth/verify/route.ts`

```typescript
// GET /api/auth/verify?token=xxx
// Verify user email with token
```

### 2. Forgot Password
**File:** `app/api/auth/forgot-password/route.ts`

```typescript
// POST /api/auth/forgot-password
// Send password reset email
```

### 3. Reset Password
**File:** `app/api/auth/reset-password/route.ts`

```typescript
// POST /api/auth/reset-password
// Reset password with token
```

### 4. Logout
**File:** `app/api/auth/logout/route.ts`

```typescript
// POST /api/auth/logout
// Clear session from Redis
```

### 5. Get Current User
**File:** `app/api/auth/me/route.ts`

```typescript
// GET /api/auth/me
// Return current user data
```

### 6. List Emails
**File:** `app/api/emails/route.ts`

```typescript
// GET /api/emails?folder=inbox&page=1&limit=20
// List user's emails with pagination and filters
```

### 7. Get Email Details
**File:** `app/api/emails/[id]/route.ts`

```typescript
// GET /api/emails/:id
// Get single email with thread
```

### 8. Send Email
**File:** `app/api/emails/send/route.ts`

```typescript
// POST /api/emails/send
// Send new email (mock SMTP for now)
```

### 9. Save Draft
**File:** `app/api/emails/draft/route.ts`

```typescript
// POST /api/emails/draft
// Save email as draft
```

### 10. Update Email
**File:** `app/api/emails/[id]/route.ts`

```typescript
// PUT /api/emails/:id
// Update email (mark read, star, move folder, add labels)
```

### 11. Delete Email
**File:** `app/api/emails/[id]/route.ts`

```typescript
// DELETE /api/emails/:id
// Soft delete (move to trash)
```

### 12. Search Emails
**File:** `app/api/emails/search/route.ts`

```typescript
// POST /api/emails/search
// Full-text search using MongoDB text index
```

### 13. Contacts CRUD
**Files:** `app/api/contacts/route.ts` and `app/api/contacts/[id]/route.ts`

```typescript
// GET /api/contacts - List contacts
// POST /api/contacts - Create contact
// PUT /api/contacts/:id - Update contact
// DELETE /api/contacts/:id - Delete contact
```

### 14. Calendar Events CRUD
**Files:** `app/api/calendar/route.ts` and `app/api/calendar/[id]/route.ts`

```typescript
// GET /api/calendar?start=2024-01-01&end=2024-01-31 - List events
// POST /api/calendar - Create event
// PUT /api/calendar/:id - Update event
// DELETE /api/calendar/:id - Delete event
```

### 15. File Upload
**File:** `app/api/upload/route.ts`

```typescript
// POST /api/upload
// Upload file to Google Cloud Storage
// Return file URL
```

## Example: List Emails Implementation

```typescript
// app/api/emails/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Email } from '@/models/Email';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'inbox';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Connect to database
    await connectDB();

    // Query emails
    const query: any = {
      userId: payload.userId,
      folder,
    };

    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('labels')
      .lean();

    const total = await Email.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List emails error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Mock SMTP Service

For development, create a mock email sender:

```typescript
// lib/utils/mockSmtp.ts
export async function sendMockEmail(to: string[], subject: string, body: string) {
  console.log('📧 Mock Email Sent:');
  console.log('To:', to.join(', '));
  console.log('Subject:', subject);
  console.log('Body:', body);
  
  // In production, replace with real SMTP or service like SendGrid
  return { success: true, messageId: `mock-${Date.now()}` };
}
```

## Google Cloud Storage Integration

```typescript
// lib/storage/gcs.ts
import { Storage } from '@google-cloud/storage';
import { config } from '../config';

let storage: Storage;

function getStorage() {
  if (!storage) {
    storage = new Storage({
      projectId: config.gcsProjectId,
      keyFilename: config.gcsKeyFile,
      // Or use credentials JSON for Cloud Run
      // credentials: JSON.parse(config.gcsCredentialsJson || '{}'),
    });
  }
  return storage;
}

export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const bucket = getStorage().bucket(config.gcsBucketName);
  const file = bucket.file(`attachments/${Date.now()}-${fileName}`);

  await file.save(fileBuffer, {
    metadata: { contentType: mimeType },
    public: false, // Set to true if you want public URLs
  });

  // Generate signed URL (valid for 1 hour)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
  });

  return url;
}
```

## Rate Limiting Middleware

```typescript
// lib/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';
import { cache } from '../redis/client';
import { config } from '../config';

export async function rateLimit(request: NextRequest, identifier: string) {
  const key = `ratelimit:${identifier}`;
  const count = await cache.increment(key, config.rateLimitWindow / 1000);

  if (count > config.rateLimitMax) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  return null; // No rate limit exceeded
}

// Usage in API route:
// const rateLimitResponse = await rateLimit(request, payload.userId);
// if (rateLimitResponse) return rateLimitResponse;
```

## Error Handling Best Practices

1. **Always use try-catch blocks**
2. **Log errors with context**
3. **Return appropriate HTTP status codes**
4. **Don't expose sensitive information in error messages**
5. **Validate all inputs with Zod**

## Testing APIs

Use tools like:
- **Postman** - GUI for API testing
- **curl** - Command line testing
- **Thunder Client** - VS Code extension

Example curl request:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# List emails (with token)
curl -X GET "http://localhost:3000/api/emails?folder=inbox" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

1. Implement remaining authentication endpoints
2. Build email management APIs
3. Add contacts and calendar APIs
4. Integrate Google Cloud Storage
5. Add rate limiting middleware
6. Write API tests
7. Create frontend pages

---

**Refer to the examples in `app/api/auth/` for implementation patterns.**
