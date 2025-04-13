// Gesture API that stores and retrieves gesture data
import { NextResponse } from 'next/server';

// Map raw gesture names to actions
const gestureActionMap: Record<string, string> = {
  'open_palm': 'pause',
  'pointing': 'next',
  'fist': 'play',
  'victory': 'crossfade',
  'thumbs_up': 'volume_up'
};

// Global cache for gesture data (updated by client-side code)
let gestureCache = {
  gesture: '',
  confidence: 0,
  lastUpdated: 0 // timestamp
};

// This function will be called from client-side to update the cache
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (data && typeof data.gesture === 'string') {
      gestureCache = {
        gesture: data.gesture,
        confidence: data.confidence || 0,
        lastUpdated: Date.now()
      };
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
  } catch (error) {
    console.error('Error updating gesture data:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  // If we have recent gesture data in cache (less than 2 seconds old)
  if (gestureCache.lastUpdated > Date.now() - 2000) {
    const { gesture, confidence } = gestureCache;
    
    // Map the detected gesture to an action
    const action = gestureActionMap[gesture.toLowerCase()] || '';
    
    return NextResponse.json({
      gesture,
      action,
      confidence
    });
  }
  
  // Fallback to random gestures if no recent data available
  const mockGestures = [
    { gesture: '✋', action: 'pause', confidence: 0.94 },
    { gesture: '👉', action: 'next', confidence: 0.88 },
    { gesture: '👌', action: 'play', confidence: 0.91 },
    { gesture: '✌️', action: 'crossfade', confidence: 0.92 }
  ];

  const result = mockGestures[Math.floor(Math.random() * mockGestures.length)];
  return NextResponse.json(result);
}
