import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

/**
 * Authentication middleware for protected API routes
 * Verifies JWT token and attaches user data to request
 */
export async function requireAuth(request: NextRequest): Promise<{
  authorized: boolean;
  user?: { userId: string; email: string; name: string };
  response?: NextResponse;
}> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized - No token provided' },
          { status: 401 }
        ),
      };
    }

    // Extract and verify token
    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized - Invalid or expired token' },
          { status: 401 }
        ),
      };
    }

    // Return user data
    return {
      authorized: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
      },
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized - Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Helper to extract user from request in API routes
 */
export async function getAuthUser(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized || !auth.user) {
    throw new Error('Unauthorized');
  }
  
  return auth.user;
}
