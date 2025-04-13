"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Camera, Eye, EyeOff, HandMetal, Video, VideoOff, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface CameraViewProps {
  className?: string
}

export default function CameraView({ className }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isOn, setIsOn] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [motionDetected, setMotionDetected] = useState(false)

  // Simulate motion detection (in a real app, this would use computer vision)
  useEffect(() => {
    if (isOn) {
      const interval = setInterval(() => {
        setMotionDetected(Math.random() > 0.6)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isOn])

  const toggleCamera = async () => {
    try {
      if (!isOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsOn(true)
      } else {
        const stream = videoRef.current?.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        setIsOn(false)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-600/30 p-2 rounded-lg mr-3">
            <Camera className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Motion Controls</h2>
            <p className="text-gray-300 text-sm">Use hand gestures to control the music</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCamera}
            className="h-9 bg-gray-800/80 border-gray-700 hover:bg-purple-900/40 hover:border-purple-500/40"
          >
            {isOn ? (
              <>
                <VideoOff className="mr-2 h-4 w-4" />
                <span>Turn Off</span>
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                <span>Turn On</span>
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            disabled={!isOn}
            className="h-9 bg-gray-800/80 border-gray-700 hover:bg-purple-900/40 hover:border-purple-500/40 disabled:opacity-50"
          >
            <ZoomIn className="mr-2 h-4 w-4" />
            <span>{isFullscreen ? "Normal" : "Enlarge"}</span>
          </Button>
        </div>
      </div>

      <div className={cn(
        "relative overflow-hidden rounded-xl border transition-all duration-300",
        isFullscreen ? "h-[600px]" : "h-[350px]",
        isOn ? "border-purple-500/30" : "border-gray-700",
        motionDetected && isOn && "ring-2 ring-purple-500/50"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>
        
        {/* Camera feedback overlay - only visible when motion is detected */}
        {motionDetected && isOn && (
          <div className="absolute inset-0 bg-purple-500/10 animate-pulse z-20 pointer-events-none"></div>
        )}
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-10"></div>

        {!isOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-gray-700 text-center">
              <VideoOff className="mx-auto h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Camera is turned off</h3>
              <p className="text-gray-400 text-sm mb-4">Turn on your camera to enable motion detection</p>
              <Button
                onClick={toggleCamera}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Video className="mr-2 h-4 w-4" />
                <span>Enable Camera</span>
              </Button>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            isOn ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Motion indicator */}
        {isOn && (
          <div className="absolute bottom-3 left-3 flex items-center space-x-2 z-30 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className={cn(
              "h-3 w-3 rounded-full",
              motionDetected ? "bg-green-500 animate-pulse" : "bg-gray-500"
            )} />
            <span className="text-xs font-medium text-white">
              {motionDetected ? "Motion Detected" : "No Motion"}
            </span>
          </div>
        )}
        
        {/* Hand icon showing in corner */}
        {isOn && (
          <div className="absolute top-3 right-3 z-30 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
            <HandMetal className="h-5 w-5 text-purple-400" />
          </div>
        )}
      </div>

      {isOn && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
              <Eye className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Detection Active</h3>
              <p className="text-xs text-gray-400">AI is watching your movements</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
              <HandMetal className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Gesture Controls</h3>
              <p className="text-xs text-gray-400">Use hand motions to control DJ</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 