"use client"

import { useEffect, useState } from "react"
import { useGesturePolling } from "../app/utils/useGesturesPolling"
import * as audioUtils from "../app/utils/audioUtils"
import * as midiUtils from "../app/utils/midiUtils"
import WebcamView from "../app/components/webcam-view"
import AudioControls from "../app/components/audio-controls"
import TrackDisplay from "../app/components/track-display"
import GestureDisplay from "../app/components/gesture-display"
import AiSuggestions from "../app/components/ai-suggestions"
import DJControls from "../app/components/dj-controls"
import { Button } from "@/app/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const [currentGesture, setCurrentGesture] = useState("")
  const [currentTrack, setCurrentTrack] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const { toast } = useToast()

  // MIDI INIT
  useEffect(() => {
    if (isStarted) {
      midiUtils.initMidi()
    }
  }, [isStarted])

  // Update track info
  useEffect(() => {
    if (isStarted) {
      setCurrentTrack(audioUtils.getCurrentTrackName())
    }
  }, [isStarted, isPlaying])

  // Handle gesture-triggered actions
  const handleAction = (action: string) => {
    if (!isStarted) return

    switch (action) {
      case "play":
        audioUtils.playTrack()
        setIsPlaying(true)
        toast({ title: "▶️ Playing", description: audioUtils.getCurrentTrackName() })
        break
      case "pause":
        audioUtils.pauseTrack()
        setIsPlaying(false)
        toast({ title: "⏸️ Paused", description: "Playback paused" })
        break
      case "next":
        audioUtils.nextTrack()
        setCurrentTrack(audioUtils.getCurrentTrackName())
        toast({ title: "⏭️ Next", description: audioUtils.getCurrentTrackName() })
        break
      case "crossfade":
        audioUtils.applyFX("crossfade")
        toast({ title: "🎚️ Crossfade", description: "Effect applied" })
        break
      default:
        break
    }
  }

  // Gesture polling
  useGesturePolling({
    onGesture: setCurrentGesture,
    onAction: handleAction,
    onConfidence: setConfidence,
    endpoint: "/api/gesture"
  })

  // Additionally listen for direct gesture events from the GestureMidiEngine
  useEffect(() => {
    if (!isStarted) return;

    // Map of gestures to actions
    const gestureToAction: Record<string, string> = {
      'open_palm': 'pause',
      'pointing': 'next',
      'fist': 'play',
      'victory': 'crossfade',
      'thumbs_up': 'volume_up'
    };
    
    const handleGestureUpdate = (event: CustomEvent) => {
      if (event.detail) {
        const { gesture, confidence } = event.detail;
        setCurrentGesture(gesture);
        setConfidence(confidence);
        
        // Look up the action for this gesture
        const action = gestureToAction[gesture.toLowerCase()];
        if (action) {
          handleAction(action);
        }
      }
    };
    
    // Add event listener with type assertion
    window.addEventListener('gestureupdate', handleGestureUpdate as EventListener);
    
    return () => {
      window.removeEventListener('gestureupdate', handleGestureUpdate as EventListener);
    };
  }, [isStarted, handleAction]);

  const handleStart = async () => {
    try {
      audioUtils.setTrackList([
        "/tracks/track2.mp3",
        "/tracks/track1.mp3",
        "/tracks/track3.mp3"
      ])
      setIsStarted(true)
      toast({
        title: "👋 DJMotion Started",
        description: "Wave your hand to control music!"
      })
    } catch (error) {
      console.error("Failed to start:", error)
      toast({
        title: "❌ Error",
        description: "Could not start the app",
        variant: "destructive"
      })
    }
  }

  // MIDI control callbacks
  const handleMidiDeviceChange = (device: string) => {
    midiUtils.setMidiDevice(device)
    toast({ title: "🎛️ MIDI Device", description: device })
  }

  const handleBpmChange = (bpm: number) => {
    midiUtils.setBpm?.(bpm)
    toast({ title: "🕒 BPM Updated", description: `${bpm} BPM` })
  }

  const handleChannelChange = (channel: number) => {
    console.log("MIDI channel changed to:", channel)
  }

  const handleSendMidiNotes = (enabled: boolean) => {
    midiUtils.enableMidi?.(enabled)
    toast({
      title: enabled ? "🎹 MIDI Enabled" : "MIDI Disabled",
      description: enabled ? "Now sending MIDI" : "MIDI output off"
    })
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            <span className="text-purple-400">DJ</span>Motion
          </h1>
          <p className="text-gray-400">Control your music with hand gestures</p>
        </header>

        {!isStarted ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-20">
            <div className="max-w-md text-center">
              <h2 className="mb-4 text-2xl font-bold">Ready to DJ with your hands?</h2>
              <p className="mb-6 text-gray-400">Start session to begin camera + MIDI tracking</p>
              <Button size="lg" onClick={handleStart} className="bg-purple-600 hover:bg-purple-700">
                🎬 Start DJing
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col space-y-6">
              <WebcamView />
              <GestureDisplay gesture={currentGesture} confidence={confidence} />
            </div>

            <div className="flex flex-col space-y-6">
              <TrackDisplay currentTrack={currentTrack} isPlaying={isPlaying} />
              <AudioControls
                isPlaying={isPlaying}
                onPlay={() => handleAction("play")}
                onPause={() => handleAction("pause")}
                onNext={() => handleAction("next")}
                onCrossfade={() => handleAction("crossfade")}
              />

              <Tabs defaultValue="gestures" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="gestures">Gesture Guide</TabsTrigger>
                  <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
                  <TabsTrigger value="controls">MIDI Controls</TabsTrigger>
                </TabsList>

                <TabsContent value="gestures" className="rounded-md border border-gray-800 bg-gray-900 p-4">
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center"><span className="mr-2 text-xl">👋</span> Wave to play/pause</li>
                    <li className="flex items-center"><span className="mr-2 text-xl">✌️</span> Peace = crossfade</li>
                    <li className="flex items-center"><span className="mr-2 text-xl">👆</span> Point up = next track</li>
                    <li className="flex items-center"><span className="mr-2 text-xl">👍</span> Thumbs up = volume boost</li>
                  </ul>
                </TabsContent>

                <TabsContent value="ai" className="rounded-md border border-gray-800 bg-gray-900 p-4">
                  <AiSuggestions
                    onSelectTrack={(track) => {
                      audioUtils.playTrackByFilename(track)
                      setIsPlaying(true)
                      setCurrentTrack(track)
                    }}
                  />
                </TabsContent>

                <TabsContent value="controls" className="p-0">
                  <DJControls
                    onSelectMidiDevice={handleMidiDeviceChange}
                    onBpmChange={handleBpmChange}
                    onChannelChange={handleChannelChange}
                    onSendMidiNotes={handleSendMidiNotes}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
