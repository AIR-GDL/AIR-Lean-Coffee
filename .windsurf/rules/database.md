---
trigger: always_on
---

# Database & API Guidelines

## MongoDB Best Practices

### Connection Management

- Use proper connection pooling
- Create singleton connection instance
- Reuse connections across requests
- Handle connection errors gracefully
- Close connections appropriately in serverless environments

Example connection singleton:
```typescript
// lib/mongodb.ts
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

### Data Models

- Use TypeScript interfaces for models
- Implement data validation before database operations
- Handle ObjectId conversions properly
- Use proper indexes for frequently queried fields

```typescript
// models/User.ts
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends User {
  _id: ObjectId;
}
```

### Error Handling

Always wrap database operations in try-catch:
```typescript
export async function getUsers(): Promise<User[]> {
  try {
    const client = await clientPromise;
    const db = client.db('mydb');
    const users = await db.collection<User>('users').find({}).toArray();
    return users;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch users');
  }
}
```

### Data Validation

Validate data before database operations:
```typescript
const createUser = async (userData: Partial<User>) => {
  // Validate
  if (!userData.name || !userData.email) {
    throw new Error('Name and email are required');
  }
  
  if (!isValidEmail(userData.email)) {
    throw new Error('Invalid email format');
  }
  
  // Create
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('users').insertOne({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return result;
};
```

## API Design

### RESTful Conventions

Follow REST principles:
- `GET` - Retrieve resource(s)
- `POST` - Create new resource
- `PUT` - Update entire resource
- `PATCH` - Partial update
- `DELETE` - Remove resource

### HTTP Status Codes

Use appropriate status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Request/Response Structure

Consistent response structure:
```typescript
// Success response
{
  data: { /* resource data */ },
  message?: 'Success message'
}

// Error response
{
  error: 'Error message',
  details?: { /* validation errors */ }
}
```

### Input Validation

Always validate and sanitize inputs:
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }
    
    // Process
    const result = await createUser(body);
    
    return NextResponse.json(
      { data: result, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Security

### Input Sanitization

- Never trust user input
- Sanitize all inputs before processing
- Use parameterized queries to prevent injection
- Validate data types and formats

### Authentication & Authorization

- Implement proper authentication for protected routes
- Verify user permissions before data access
- Use secure session management
- Never expose sensitive data in responses

### Environment Variables

- Store sensitive data in environment variables
- Never commit secrets to version control
- Use `.env.local` for local development
- Validate required environment variables on startup

### Rate Limiting

Implement rate limiting for API routes to prevent abuse:
```typescript
// Consider using libraries like 'express-rate-limit' or custom middleware
```

### CORS

Configure CORS properly for API routes:
```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'something' });
  
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
  return response;
}
```
