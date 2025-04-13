"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Camera, CameraOff } from "lucide-react"
import GestureMidiEngine from "./gesture-midi-engine"

export default function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showGestureEngine, setShowGestureEngine] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    const setupCamera = async () => {
      if (!isActive) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          // After camera is loaded, enable gesture engine
          videoRef.current.onloadeddata = () => {
            setShowGestureEngine(true);
            
            // Connect the input_video from GestureMidiEngine to our webcam feed
            setTimeout(() => {
              const inputVideo = document.querySelector('.input_video') as HTMLVideoElement;
              if (inputVideo && videoRef.current) {
                inputVideo.srcObject = videoRef.current.srcObject;
              }
            }, 500);
          };
        }
      } catch (error) {
        console.error("Error accessing webcam:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setupCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      setShowGestureEngine(false);
    }
  }, [isActive])

  const toggleCamera = () => {
    setIsActive((prev) => !prev)
    setShowGestureEngine(false);
  }

  return (
    <Card className="overflow-hidden border-gray-800 bg-gray-950">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
            </div>
          )}

          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${isLoading ? "opacity-0" : "opacity-100"}`}
                onCanPlay={() => setIsLoading(false)}
              />
              {showGestureEngine && <GestureMidiEngine />}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-900">
              <CameraOff className="h-12 w-12 text-gray-600" />
            </div>
          )}

          <div className="absolute bottom-4 right-4">
            <Button size="sm" variant="secondary" className="bg-gray-800/80 hover:bg-gray-700" onClick={toggleCamera}>
              {isActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
