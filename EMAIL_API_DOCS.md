# Email Management API Documentation

Complete API reference for AbsurdLabs email management system.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All email endpoints require authentication via JWT Bearer token.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token by logging in at `POST /api/auth/login`.

---

## Email Endpoints

### List Emails

Get paginated list of emails with filters.

**Endpoint:** `GET /api/emails`

**Query Parameters:**
- `folder` (string, optional) - Filter by folder (inbox, sent, drafts, trash, custom). Default: "inbox"
- `page` (number, optional) - Page number. Default: 1
- `limit` (number, optional) - Items per page (1-100). Default: 20
- `labelId` (string, optional) - Filter by label ID
- `isRead` (boolean, optional) - Filter by read status
- `isStarred` (boolean, optional) - Filter by starred status

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/emails?folder=inbox&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "email_id",
      "from": { "email": "sender@example.com", "name": "Sender Name" },
      "to": [{ "email": "you@example.com", "name": "Your Name" }],
      "subject": "Email Subject",
      "textBody": "Email content...",
      "folder": "inbox",
      "isRead": false,
      "isStarred": false,
      "labels": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Get Email Details

Get single email with full thread.

**Endpoint:** `GET /api/emails/:id`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/emails/EMAIL_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": {
      "_id": "email_id",
      "from": { "email": "sender@example.com", "name": "Sender" },
      "to": [{ "email": "you@example.com" }],
      "subject": "Email Subject",
      "textBody": "Email content...",
      "htmlBody": "<p>Email content...</p>",
      "attachments": [],
      "folder": "inbox",
      "isRead": true,
      "isStarred": false,
      "labels": [],
      "threadId": "thread_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "thread": [
      // Array of related emails in the thread
    ]
  }
}
```

**Note:** Automatically marks email as read.

---

### Send Email

Send a new email.

**Endpoint:** `POST /api/emails/send`

**Request Body:**
```json
{
  "to": [
    { "email": "recipient@example.com", "name": "Recipient Name" }
  ],
  "cc": [
    { "email": "cc@example.com", "name": "CC Name" }
  ],
  "bcc": [
    { "email": "bcc@example.com" }
  ],
  "subject": "Email Subject",
  "textBody": "Plain text email content",
  "htmlBody": "<p>HTML email content</p>",
  "attachments": [
    {
      "filename": "document.pdf",
      "url": "https://storage.example.com/file.pdf",
      "size": 12345
    }
  ],
  "inReplyTo": "original_email_id",
  "threadId": "existing_thread_id"
}
```

**Required Fields:**
- `to` - Array of recipients (min 1)
- `subject` - Email subject
- `textBody` - Plain text body

**Optional Fields:**
- `cc` - Carbon copy recipients
- `bcc` - Blind carbon copy recipients
- `htmlBody` - HTML formatted body
- `attachments` - File attachments
- `inReplyTo` - ID of email being replied to (for threading)
- `threadId` - Existing thread ID (for threading)

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/emails/send" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "alice@example.com", "name": "Alice"}],
    "subject": "Hello from AbsurdLabs",
    "textBody": "This is a test email."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "_id": "new_email_id",
    "from": { "email": "you@example.com", "name": "Your Name" },
    "to": [{ "email": "alice@example.com", "name": "Alice" }],
    "subject": "Hello from AbsurdLabs",
    "folder": "sent",
    "messageId": "mock-1234567890-abc123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Save Draft

Save or update email draft.

**Endpoint:** `POST /api/emails/draft`

**Request Body:**
```json
{
  "to": [{ "email": "recipient@example.com" }],
  "subject": "Draft Subject",
  "textBody": "Draft content...",
  "draftId": "existing_draft_id"
}
```

**All fields optional** (can save incomplete drafts)

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/emails/draft" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "alice@example.com"}],
    "subject": "Draft Email",
    "textBody": "Work in progress..."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Draft saved",
  "data": {
    "_id": "draft_id",
    "to": [{ "email": "alice@example.com" }],
    "subject": "Draft Email",
    "textBody": "Work in progress...",
    "folder": "drafts",
    "isDraft": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Email

Update email properties (read status, starred, folder, labels).

**Endpoint:** `PUT /api/emails/:id`

**Request Body:**
```json
{
  "isRead": true,
  "isStarred": true,
  "folder": "inbox",
  "labels": ["label_id_1", "label_id_2"]
}
```

**All fields optional** (only include fields to update)

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/emails/EMAIL_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isStarred": true,
    "labels": ["label_id"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "email_id",
    "isStarred": true,
    "labels": [
      { "_id": "label_id", "name": "Important", "color": "#EF4444" }
    ]
  }
}
```

---

### Delete Email

Delete email (move to trash or permanent delete).

**Endpoint:** `DELETE /api/emails/:id`

**Query Parameters:**
- `permanent` (boolean, optional) - Permanently delete. Default: false

**Behavior:**
- If email is NOT in trash: moves to trash folder
- If email IS in trash OR `permanent=true`: permanently deletes

**Example Request:**
```bash
# Move to trash
curl -X DELETE "http://localhost:3000/api/emails/EMAIL_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Permanent delete
curl -X DELETE "http://localhost:3000/api/emails/EMAIL_ID?permanent=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Email moved to trash"
}
```

---

### Search Emails

Full-text search with advanced filters.

**Endpoint:** `POST /api/emails/search`

**Request Body:**
```json
{
  "query": "search keywords",
  "folder": "inbox",
  "from": "sender@example.com",
  "to": "recipient@example.com",
  "hasAttachments": true,
  "isStarred": false,
  "isRead": true,
  "dateFrom": "2024-01-01T00:00:00.000Z",
  "dateTo": "2024-12-31T23:59:59.999Z",
  "page": 1,
  "limit": 20
}
```

**Required Fields:**
- `query` - Search keywords (searches subject and body)

**Optional Fields:**
- `folder` - Filter by folder
- `from` - Filter by sender email (partial match)
- `to` - Filter by recipient email (partial match)
- `hasAttachments` - Filter by attachment presence
- `isStarred` - Filter by starred status
- `isRead` - Filter by read status
- `dateFrom` - Filter by date range (start)
- `dateTo` - Filter by date range (end)
- `page` - Page number
- `limit` - Results per page (1-100)

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/emails/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "meeting notes",
    "hasAttachments": true,
    "page": 1,
    "limit": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "email_id",
      "subject": "Meeting Notes - Q1 Planning",
      "from": { "email": "manager@example.com" },
      "attachments": [
        { "filename": "notes.pdf", "size": 12345 }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## Folder Endpoints

### List Folders

Get all user folders.

**Endpoint:** `GET /api/folders`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/folders" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "folder_id",
      "name": "Projects",
      "color": "#10B981",
      "icon": "briefcase",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Folder

Create a new custom folder.

**Endpoint:** `POST /api/folders`

**Request Body:**
```json
{
  "name": "Folder Name",
  "color": "#10B981",
  "icon": "folder"
}
```

**Required Fields:**
- `name` - Folder name (1-50 characters, must be unique)

**Optional Fields:**
- `color` - Hex color code. Default: "#6B7280"
- `icon` - Icon name. Default: "folder"

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/folders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projects",
    "color": "#10B981",
    "icon": "briefcase"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "_id": "new_folder_id",
    "name": "Projects",
    "color": "#10B981",
    "icon": "briefcase"
  }
}
```

---

## Label Endpoints

### List Labels

Get all user labels.

**Endpoint:** `GET /api/labels`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/labels" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "label_id",
      "name": "Important",
      "color": "#EF4444",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Label

Create a new label.

**Endpoint:** `POST /api/labels`

**Request Body:**
```json
{
  "name": "Label Name",
  "color": "#3B82F6"
}
```

**Required Fields:**
- `name` - Label name (1-30 characters, must be unique)

**Optional Fields:**
- `color` - Hex color code. Default: "#3B82F6"

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/labels" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Important",
    "color": "#EF4444"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Label created successfully",
  "data": {
    "_id": "new_label_id",
    "name": "Important",
    "color": "#EF4444"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `409` - Conflict (duplicate name)
- `500` - Internal Server Error

---

## Testing

Use the provided test script:

```bash
./test-api.sh
```

Or test manually with curl/Postman using the examples above.

---

## Threading

Emails are automatically threaded based on:
1. `inReplyTo` field - Links reply to original email
2. `threadId` field - Groups emails in same conversation

**To reply to an email:**
```json
{
  "to": [...],
  "subject": "Re: Original Subject",
  "textBody": "Reply content",
  "inReplyTo": "original_email_id"
}
```

The system automatically:
- Finds the original email's thread
- Adds the reply to that thread
- Updates thread metadata

---

## Mock SMTP

Currently using mock SMTP service that logs emails to console.

**To integrate real SMTP:**
1. Replace `sendMockEmail()` in `lib/utils/mockSmtp.ts`
2. Use Nodemailer or similar library
3. Configure SMTP credentials in `.env`

See comments in `mockSmtp.ts` for implementation example.

---

## Rate Limiting

Not yet implemented. See `lib/middleware/rateLimit.ts` in API_GUIDE.md for implementation.

---

## Next Steps

1. Implement remaining auth endpoints (verify, forgot password, reset)
2. Build frontend UI for email management
3. Add real SMTP integration
4. Implement rate limiting
5. Add comprehensive error logging
6. Write unit tests

---

**For more details, see:**
- [README.md](./README.md) - Project overview
- [API_GUIDE.md](./API_GUIDE.md) - Implementation guide
- [QUICKSTART.md](./QUICKSTART.md) - Setup instructions
