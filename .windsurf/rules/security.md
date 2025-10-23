---
trigger: always_on
---

# Security Best Practices

## Input Validation & Sanitization

### Always Validate User Input

- Validate all user inputs on both client and server
- Never trust data from the client
- Use TypeScript for compile-time type checking
- Implement runtime validation for all API inputs

```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};
```

### Prevent Injection Attacks

- Use parameterized queries for database operations
- Sanitize HTML input to prevent XSS
- Validate and sanitize file uploads
- Use Content Security Policy (CSP) headers

## Environment Variables

### Secure Configuration

- Store all secrets in environment variables
- Never commit `.env.local` or `.env` files to version control
- Use `NEXT_PUBLIC_` prefix ONLY for truly public variables
- Validate required environment variables on startup

```typescript
// lib/env.ts
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'] as const;

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Client vs Server Variables

```bash
# Server-only (never exposed to client)
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
API_SECRET_KEY=...

# Client-accessible (exposed in browser bundle)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=My App
```

## Authentication & Authorization

### Password Security

- Never store passwords in plain text
- Use bcrypt or similar for password hashing
- Implement proper password requirements
- Use secure password reset flows

```typescript
import bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### Session Management

- Use secure, httpOnly cookies for session tokens
- Implement proper session expiration
- Regenerate session IDs after login
- Clear sessions on logout

### JWT Best Practices

If using JWT:
- Use strong secret keys
- Set appropriate expiration times
- Verify tokens on every protected request
- Store tokens securely (httpOnly cookies, not localStorage)

## HTTPS & Secure Headers

### Always Use HTTPS in Production

- Enforce HTTPS for all connections
- Redirect HTTP to HTTPS
- Use HSTS (HTTP Strict Transport Security)

### Security Headers

Configure security headers in `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

## API Security

### Rate Limiting

Implement rate limiting to prevent abuse:
- Limit requests per IP address
- Implement exponential backoff
- Use CAPTCHA for sensitive operations

### API Key Protection

- Never expose API keys in client-side code
- Use server-side API routes as proxies
- Rotate keys regularly
- Implement key-based rate limiting

### CORS Configuration

Configure CORS appropriately:
```typescript
export async function GET(request: NextRequest) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const origin = request.headers.get('origin');
  
  const response = NextResponse.json({ data: 'something' });
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  return response;
}
```

## Data Protection

### Sensitive Data Handling

- Never log sensitive data (passwords, tokens, personal info)
- Encrypt sensitive data at rest
- Use HTTPS for data in transit
- Implement proper data retention policies

### Database Security

- Use least privilege principle for database users
- Implement proper access controls
- Regularly backup data
- Encrypt database connections

## File Upload Security

If handling file uploads:
- Validate file types and sizes
- Scan for malware
- Store uploads outside web root
- Use unique, non-guessable filenames
- Implement upload rate limiting

```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
const maxSize = 5 * 1024 * 1024; // 5MB

const validateFile = (file: File): boolean => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  return true;
};
```

## Security Checklist

Before deploying:
- [ ] All secrets in environment variables
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Authentication implemented properly
- [ ] Authorization checks in place
- [ ] Rate limiting configured
- [ ] CORS configured appropriately
- [ ] No sensitive data in logs
- [ ] Dependencies up to date (no known vulnerabilities)
