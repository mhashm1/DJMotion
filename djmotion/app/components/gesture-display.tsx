"use client"

import { Card, CardContent } from "@/app/components/ui/card"
import { Progress } from "@/app/components/ui/progress"
import { Hand } from "lucide-react"
import { useEffect, useState } from "react"

interface GestureDisplayProps {
  gesture: string
  confidence: number
}

export default function GestureDisplay({ 
  gesture: initialGesture = "", 
  confidence: initialConfidence = 0 
}: GestureDisplayProps) {
  const [gesture, setGesture] = useState(initialGesture)
  const [confidence, setConfidence] = useState(initialConfidence)
  const [lastDetected, setLastDetected] = useState<Date | null>(null)

  useEffect(() => {
    // Keep our props in sync
    setGesture(initialGesture)
    setConfidence(initialConfidence)
  }, [initialGesture, initialConfidence])

  useEffect(() => {
    // Listen for gesture updates from the GestureMidiEngine
    const handleGestureUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setGesture(event.detail.gesture || "")
        setConfidence(event.detail.confidence || 0)
        setLastDetected(new Date())
      }
    }

    // Add event listener with type assertion
    window.addEventListener('gestureupdate', handleGestureUpdate as EventListener)
    
    return () => {
      window.removeEventListener('gestureupdate', handleGestureUpdate as EventListener)
    }
  }, [])

  // Find appropriate emoji for detected gesture
  const getGestureEmoji = (gesture: string) => {
    const gestureMap: Record<string, string> = {
      "open_palm": "✋",
      "pointing": "👉",
      "fist": "✊",
      "victory": "✌️",
      "thumbs_up": "👍",
      "": "👋", // default
    }
    
    return gestureMap[gesture.toLowerCase()] || gestureMap[""]
  }

  return (
    <Card className="border-gray-800 bg-gray-950">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Detected Gesture</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-900/30">
              <Hand className="h-4 w-4 text-purple-400" />
            </div>
          </div>

          <div className="flex h-16 items-center justify-center rounded-md border border-gray-800 bg-gray-900 relative">
            <span className={`text-3xl transition-all duration-300 ${lastDetected && Date.now() - lastDetected.getTime() < 1000 ? 'scale-125' : 'scale-100'}`}>
              {getGestureEmoji(gesture)}
            </span>
            {gesture && (
              <span className="absolute bottom-1 text-xs text-gray-500">
                {gesture}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <Progress value={confidence * 100} className="h-2 bg-gray-800" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
