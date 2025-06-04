// src/components/dual-insights-form.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Send, StopCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { generalAdvice, GeneralAdviceOutput } from '@/ai/flows/general-advice';
import { voiceToTextInput, VoiceToTextInputOutput } from '@/ai/flows/voice-to-text-input';
import { PerspectiveCard } from './perspective-card';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const MAX_TEXT_LENGTH = 500;
const MAX_VOICE_DURATION_MS = 30000; // 30 seconds

type Advice = {
  gentleCoachAdvice: string;
  noBsCoachAdvice: string;
} | null;

export function DualInsightsForm() {
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [advice, setAdvice] = useState<Advice>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeInputMode, setActiveInputMode] = useState<"text" | "voice">("text");

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const handleTextSubmit = async () => {
    if (!userInput.trim()) {
      setError("Please enter your dilemma.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setAdvice(null);

    try {
      const result: GeneralAdviceOutput = await generalAdvice({ dilemma: userInput });
      setAdvice(result);
    } catch (e) {
      console.error("Error generating advice:", e);
      setError("Failed to generate advice. Please try again.");
      toast({
        title: "Error",
        description: "Could not generate advice. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // Convert Blob to base64 data URI
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            if (!base64Audio) {
              setError("Failed to process audio. Please try again.");
              setIsGenerating(false);
              return;
            }
            
            try {
              const result: VoiceToTextInputOutput = await voiceToTextInput({ audioDataUri: base64Audio });
              setAdvice({
                gentleCoachAdvice: result.gentleCoachPerspective,
                noBsCoachAdvice: result.noBSCoachPerspective,
              });
            } catch (e) {
              console.error("Error with voice input:", e);
              setError("Failed to process voice input. Please try again.");
               toast({
                title: "Voice Input Error",
                description: "Could not process your voice input.",
                variant: "destructive",
              });
            } finally {
              setIsGenerating(false);
            }
          };
           reader.onerror = () => {
            setError("Failed to read audio data.");
            setIsGenerating(false);
          };
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        setError(null);
        setAdvice(null); 
        setIsGenerating(true); // Show loading while recording and processing

        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prevTime) => {
            const newTime = prevTime + 100;
            if (newTime >= MAX_VOICE_DURATION_MS) {
              stopRecording();
            }
            return newTime;
          });
        }, 100);

      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
        setIsGenerating(false);
      }
    } else {
      setError("Audio recording is not supported by your browser.");
      setIsGenerating(false);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Note: Actual AI call happens in onstop handler after blob processing.
      // setIsGenerating(false) will be handled by the onstop handler logic.
    }
  }, [isRecording]);

  // Cleanup recording on unmount or mode change
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeInputMode === 'text' && isRecording) {
      stopRecording();
    }
  }, [activeInputMode, isRecording, stopRecording]);


  const handleRate = (perspective: string, rating: "up" | "down") => {
    console.log(`Rated ${perspective}: ${rating}`);
    toast({
      title: "Feedback Received",
      description: `You rated ${perspective} as ${rating === "up" ? "Helpful" : "Not Helpful"}.`,
    });
    // In a real app, send this to a backend.
  };

  const charCount = userInput.length;
  const remainingChars = MAX_TEXT_LENGTH - charCount;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <Tabs value={activeInputMode} onValueChange={(value) => setActiveInputMode(value as "text" | "voice")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-primary/10">
          <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Text Input</TabsTrigger>
          <TabsTrigger value="voice" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Voice Input</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeInputMode === "text" && (
        <div className="space-y-4">
          <Textarea
            placeholder="Tell us about your dilemma... (e.g., I'm feeling overwhelmed with work, or Should I change my career?)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={5}
            maxLength={MAX_TEXT_LENGTH}
            className="focus:ring-accent focus:border-accent text-base"
            disabled={isGenerating}
          />
          <div className="text-sm text-muted-foreground text-right">
            {remainingChars >=0 ? `${remainingChars} characters remaining` : <span className="text-destructive">Character limit exceeded</span>}
          </div>
          <Button onClick={handleTextSubmit} disabled={isGenerating || !userInput.trim() || remainingChars < 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Get Perspectives
          </Button>
        </div>
      )}

      {activeInputMode === "voice" && (
        <div className="space-y-4 text-center">
          {!isRecording && !isGenerating && (
             <Alert className="text-left border-accent/50">
              <Info className="h-4 w-4 text-accent" />
              <AlertTitle className="font-headline text-accent">Voice Input</AlertTitle>
              <AlertDescription>
                Click the record button to share your dilemma (up to 30 seconds).
                We'll transcribe it and provide perspectives.
              </AlertDescription>
            </Alert>
          )}
          {isRecording && (
            <div className="my-4">
              <p className="text-lg font-medium text-primary">Recording...</p>
              <Progress value={(recordingTime / MAX_VOICE_DURATION_MS) * 100} className="w-full h-2 mt-2 [&>div]:bg-accent" />
              <p className="text-sm text-muted-foreground mt-1">{(recordingTime / 1000).toFixed(1)}s / {(MAX_VOICE_DURATION_MS / 1000)}s</p>
            </div>
          )}
           {isGenerating && !isRecording && (
            <div className="my-4 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="mt-2 text-muted-foreground">Processing your voice...</p>
            </div>
          )}
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isGenerating && !isRecording}
            className={`w-full ${isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent hover:bg-accent/90'} text-accent-foreground`}
          >
            {isRecording ? <StopCircle className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
            {isRecording ? "Stop Recording" : (isGenerating ? "Processing..." : "Start Recording")}
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6 mt-8">
        {isGenerating && !advice && activeInputMode === 'text' && (
          <>
            <PerspectiveCard title="Gentle Coach" advice="" isLoading={true} onRate={() => {}} />
            <PerspectiveCard title="No-BS Coach" advice="" isLoading={true} onRate={() => {}} />
          </>
        )}
        {advice && (
          <>
            <PerspectiveCard
              title="Gentle Coach"
              advice={advice.gentleCoachAdvice}
              onRate={(rating) => handleRate("Gentle Coach", rating)}
            />
            <PerspectiveCard
              title="No-BS Coach"
              advice={advice.noBsCoachAdvice}
              onRate={(rating) => handleRate("No-BS Coach", rating)}
            />
          </>
        )}
      </div>
    </div>
  );
}
