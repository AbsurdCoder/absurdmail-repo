# Deployment Guide - AbsurdLabs

Complete guide for deploying AbsurdLabs to Google Cloud Platform.

## Prerequisites

- Google Cloud Platform account
- `gcloud` CLI installed and configured
- MongoDB Atlas account (or self-hosted MongoDB)
- Redis Cloud account (or self-hosted Redis)
- Domain name (absurdlabs.io)

## Step 1: Setup MongoDB Atlas

1. **Create MongoDB Atlas cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (M0 free tier or higher)
   - Choose Google Cloud as provider
   - Select region closest to your Cloud Run deployment

2. **Configure network access:**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Note: For production, use VPC peering or Private Link

3. **Create database user:**
   - Go to Database Access
   - Add new database user
   - Choose password authentication
   - Save username and password

4. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/absurdlabs`

## Step 2: Setup Redis Cloud

1. **Create Redis Cloud database:**
   - Go to [Redis Cloud](https://redis.com/try-free/)
   - Create a new subscription (30MB free tier)
   - Choose Google Cloud as provider
   - Select same region as Cloud Run

2. **Get connection details:**
   - Go to your database
   - Copy the endpoint and port
   - Copy the default user password
   - Format: `redis://default:password@endpoint:port`

## Step 3: Setup Google Cloud Storage

1. **Create GCS bucket:**

```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id

# Create bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://absurdlabs-attachments

# Set CORS configuration
cat > cors.json << EOF
[
  {
    "origin": ["https://absurdlabs.io", "https://*.run.app"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://absurdlabs-attachments
```

2. **Create service account:**

```bash
# Create service account
gcloud iam service-accounts create absurdlabs-storage \
  --display-name="AbsurdLabs Storage Service Account"

# Grant Storage Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:absurdlabs-storage@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create gcp-service-account-key.json \
  --iam-account=absurdlabs-storage@$PROJECT_ID.iam.gserviceaccount.com
```

## Step 4: Setup Secrets in Google Cloud

```bash
# Create secrets
echo -n "your-mongodb-connection-string" | \
  gcloud secrets create mongodb-uri --data-file=-

echo -n "your-redis-connection-string" | \
  gcloud secrets create redis-url --data-file=-

echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create jwt-secret --data-file=-

echo -n "smtp.gmail.com" | \
  gcloud secrets create smtp-host --data-file=-

echo -n "587" | \
  gcloud secrets create smtp-port --data-file=-

echo -n "your-email@gmail.com" | \
  gcloud secrets create smtp-user --data-file=-

echo -n "your-app-password" | \
  gcloud secrets create smtp-pass --data-file=-

# Store GCS credentials as secret
gcloud secrets create gcs-credentials \
  --data-file=gcp-service-account-key.json
```

## Step 5: Build and Push Docker Image

```bash
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Build image using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/absurdlabs

# Or build locally and push
docker build -t gcr.io/$PROJECT_ID/absurdlabs .
docker push gcr.io/$PROJECT_ID/absurdlabs
```

## Step 6: Deploy to Cloud Run

```bash
gcloud run deploy absurdlabs \
  --image gcr.io/$PROJECT_ID/absurdlabs \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_APP_NAME=AbsurdLabs,GCS_PROJECT_ID=$PROJECT_ID,GCS_BUCKET_NAME=absurdlabs-attachments" \
  --set-secrets="MONGODB_URI=mongodb-uri:latest,REDIS_URL=redis-url:latest,JWT_SECRET=jwt-secret:latest,SMTP_HOST=smtp-host:latest,SMTP_PORT=smtp-port:latest,SMTP_USER=smtp-user:latest,SMTP_PASS=smtp-pass:latest,GCS_CREDENTIALS_JSON=gcs-credentials:latest"
```

## Step 7: Configure Custom Domain

1. **Verify domain ownership:**

```bash
gcloud domains verify absurdlabs.io
```

2. **Map domain to Cloud Run:**

```bash
gcloud run domain-mappings create \
  --service absurdlabs \
  --domain absurdlabs.io \
  --region us-central1
```

3. **Update DNS records:**
   - Go to your domain registrar
   - Add the DNS records shown by Cloud Run
   - Typically A and AAAA records
   - Wait for DNS propagation (can take up to 48 hours)

## Step 8: Setup CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: your-gcp-project-id
  SERVICE_NAME: absurdlabs
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Build and Push
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE_NAME \
            --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
            --region $REGION \
            --platform managed
```

## Step 9: Monitoring and Logging

1. **View logs:**

```bash
gcloud run services logs read absurdlabs --region us-central1
```

2. **Setup monitoring:**
   - Go to Cloud Console > Monitoring
   - Create alerts for:
     - High error rate
     - High latency
     - Low instance count

3. **Setup uptime checks:**
   - Go to Cloud Console > Monitoring > Uptime Checks
   - Create check for https://absurdlabs.io

## Step 10: Performance Optimization

1. **Enable CDN:**

```bash
gcloud compute backend-services update absurdlabs \
  --enable-cdn \
  --global
```

2. **Configure caching headers** in your Next.js app

3. **Setup Cloud CDN** for static assets

## Troubleshooting

### Container fails to start

```bash
# Check logs
gcloud run services logs read absurdlabs --region us-central1 --limit 50

# Check environment variables
gcloud run services describe absurdlabs --region us-central1
```

### Database connection issues

- Verify MongoDB Atlas allows connections from `0.0.0.0/0`
- Check connection string format
- Verify credentials

### Redis connection issues

- Verify Redis Cloud endpoint and port
- Check password
- Ensure Redis is in same region

### Domain not working

- Verify DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Check SSL certificate status

## Cost Optimization

1. **Use Cloud Run's autoscaling:**
   - Set `--min-instances 0` for development
   - Set `--min-instances 1-2` for production

2. **MongoDB Atlas:**
   - Start with M0 (free tier)
   - Upgrade to M10+ for production

3. **Redis Cloud:**
   - Start with 30MB free tier
   - Upgrade as needed

4. **Cloud Storage:**
   - Use Standard storage class
   - Set lifecycle policies to delete old files

## Security Checklist

- [ ] Environment variables stored as secrets
- [ ] MongoDB network access restricted
- [ ] Redis password authentication enabled
- [ ] HTTPS enforced on custom domain
- [ ] CORS configured on GCS bucket
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] JWT tokens with short expiry
- [ ] Password hashing with bcrypt

## Next Steps

1. Complete API implementation
2. Build frontend pages
3. Add monitoring and alerting
4. Setup backup and disaster recovery
5. Implement rate limiting
6. Add comprehensive logging
7. Setup staging environment
8. Implement CI/CD pipeline

---

**Need help?** Check the main [README.md](./README.md) or open an issue.
