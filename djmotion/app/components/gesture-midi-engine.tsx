"use client";

import { useEffect, useRef } from "react";

// Add type declaration to Window object
declare global {
  interface Window {
    gestureData: {
      gesture: string;
      confidence: number;
      action: string;
    };
    updateGestureData: (gesture: string, confidence: number, action: string) => void;
  }
}

export default function GestureMidiEngine() {
  const gestureDataRef = useRef<{
    gesture: string;
    confidence: number;
    action: string;
  }>({ gesture: "", confidence: 0, action: "" });
  
  // This will be accessible to other components via window object
  useEffect(() => {
    // Make the gesture data accessible to other components
    window.gestureData = gestureDataRef.current;
    
    // Function to update gesture data that will be called from gesture-midi.js
    window.updateGestureData = (gesture: string, confidence: number, action: string) => {
      gestureDataRef.current.gesture = gesture;
      gestureDataRef.current.confidence = confidence;
      gestureDataRef.current.action = action;
      
      // Dispatch a custom event that other components can listen for
      const event = new CustomEvent('gestureupdate', { 
        detail: { gesture, confidence, action } 
      });
      window.dispatchEvent(event);
      
      // Also update the API cache
      fetch('/api/gesture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gesture, 
          confidence 
        }),
      }).catch(error => {
        console.error('Error updating gesture API cache:', error);
      });
    };

    const externalScripts = [
      "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3/hands.min.js",
      "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.min.js",
      "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.min.js",
      "https://cdn.jsdelivr.net/npm/webmidi"
    ];

    externalScripts.forEach((src) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }
    });

    const gestureScript = document.createElement("script");
    gestureScript.src = "/scripts/gesture-midi.js"; // Ensure this is in public/scripts
    gestureScript.async = true;
    document.body.appendChild(gestureScript);

    return () => {
      // Clean up by removing the gesture script only
      const gs = document.querySelector(`script[src="/scripts/gesture-midi.js"]`);
      if (gs) gs.remove();
      
      // Don't remove external scripts as they might be used elsewhere
      // Just clean up our global references
      window.gestureData = { gesture: "", confidence: 0, action: "" };
      window.updateGestureData = () => {};
    };
  }, []);

  return (
    <div className="relative w-full h-full" id="gesture-engine">
      {/* Core video/canvas inputs */}
      <video className="input_video hidden" style={{ display: "none" }}></video>
      <canvas className="output_canvas absolute top-0 left-0 z-10 pointer-events-none opacity-60" width="1280" height="720" />

      {/* Required hidden inputs */}
      <div style={{ display: "none" }}>
        <select id="videoSource" />
        <select id="device" />
        <input id="bpm" type="range" min="60" max="180" defaultValue="120" />
        <input id="sendMidi" type="checkbox" defaultChecked />
        <input id="gesture" type="checkbox" defaultChecked />
        <input id="selfie" type="checkbox" defaultChecked />
        <span id="fps" />

        <input id="BPMAutomateInput" defaultValue="nil" />
        <input id="sliderMinValue" defaultValue="60" />
        <input id="sliderMaxValue" defaultValue="180" />
        <input id="midiChannel" defaultValue="1" />
        <input id="trigger1Channel" defaultValue="1" />
        <input id="trigger2Channel" defaultValue="1" />
        <input id="trigger3Channel" defaultValue="1" />
        <input id="midi1NoteInput" defaultValue="60" />
        <input id="midi2NoteInput" defaultValue="62" />
        <input id="midi3NoteInput" defaultValue="64" />

        <input id="midiPitchControlInput" defaultValue="nil" />
        <input id="midiVelInput" defaultValue="nil" />
        <input id="pitchBendInput" defaultValue="nil" />
        <input id="aftertouchInput" defaultValue="nil" />

        <input id="cc1Input" defaultValue="nil" />
        <input id="cc1Controller" defaultValue="74" />
        <input id="cc1Channel" defaultValue="1" />

        <input id="cc2Input" defaultValue="nil" />
        <input id="cc2Controller" defaultValue="71" />
        <input id="cc2Channel" defaultValue="1" />

        <input id="cc3Input" defaultValue="nil" />
        <input id="cc3Controller" defaultValue="10" />
        <input id="cc3Channel" defaultValue="1" />

        <input id="cc4Input" defaultValue="nil" />
        <input id="cc4Controller" defaultValue="91" />
        <input id="cc4Channel" defaultValue="1" />
      </div>
    </div>
  );
}
