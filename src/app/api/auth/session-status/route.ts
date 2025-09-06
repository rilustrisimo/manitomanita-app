import { NextRequest, NextResponse } from 'next/server';
import { validateServerSession } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('[SESSION-STATUS] Checking server session status...');
    
    const result = await validateServerSession();
    
    console.log('[SESSION-STATUS] Server session valid:', result.isValid);
    console.log('[SESSION-STATUS] Has user:', result.user !== null);
    
    return NextResponse.json({
      hasServerSession: result.isValid,
      user: result.user,
      tokenPreview: result.user ? 'has_token' : null
    });
  } catch (error) {
    console.error('[SESSION-STATUS] Error checking session:', error);
    return NextResponse.json({
      hasServerSession: false,
      user: null,
      tokenPreview: null
    });
  }
}
