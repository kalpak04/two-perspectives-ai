"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Send, StopCircle, Loader2, AlertCircle, Info, MessageSquareHeart, MessageSquareWarning, ArrowLeft } from 'lucide-react';
import { generalAdvice, GeneralAdviceOutput } from '@/ai/flows/general-advice';
import { voiceToTextInput, VoiceToTextInputOutput } from '@/ai/flows/voice-to-text-input';
import { PerspectiveCard } from './perspective-card';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { coachChat } from '@/ai/flows/coach-chat';

const MAX_TEXT_LENGTH = 500;
const MAX_VOICE_DURATION_MS = 30000; // 30 seconds

type ViewMode = "input" | "personaSelection" | "chatView";
type SelectedPersona = "gentle" | "no-bs" | null;
type InitialAdvice = {
  gentleCoachAdvice: string;
  noBsCoachAdvice: string;
} | null;

type ChatRole = 'user' | 'coach';

export function DualInsightsForm() {
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInputMode, setActiveInputMode] = useState<"text" | "voice">("text");

  const [viewMode, setViewMode] = useState<ViewMode>("input");
  const [initialAdvice, setInitialAdvice] = useState<InitialAdvice>(null);
  const [selectedPersonaForChat, setSelectedPersonaForChat] = useState<SelectedPersona>(null);
  const [originalDilemma, setOriginalDilemma] = useState<string>("");


  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  // Chat state for the selected coach
  const [chatMessages, setChatMessages] = useState<{ sender: ChatRole, text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isCoachResponding, setIsCoachResponding] = useState(false);

  const resetToInputMode = () => {
    setUserInput("");
    setViewMode("input");
    setInitialAdvice(null);
    setSelectedPersonaForChat(null);
    setError(null);
    setOriginalDilemma("");
  };
  
  const handleInputModeChange = (mode: string) => {
    const validMode = mode as "text" | "voice";
    if (validMode === "text" || validMode === "voice") {
      setActiveInputMode(validMode);
      resetToInputMode();
      if (isRecording) {
        stopRecording(false); // Pass false as we don't want to process audio
      }
    }
  };

  const processApiResponse = (result: GeneralAdviceOutput | VoiceToTextInputOutput, dilemma: string) => {
    // Check if result exists and is an object
    if (!result || typeof result !== 'object') {
      throw new Error("Invalid API response: result is not an object");
    }

    if ('gentleCoachAdvice' in result && 'noBsCoachAdvice' in result) { // GeneralAdviceOutput
        setInitialAdvice({
            gentleCoachAdvice: result.gentleCoachAdvice,
            noBsCoachAdvice: result.noBsCoachAdvice,
        });
    } else if ('gentleCoachPerspective' in result && 'noBSCoachPerspective' in result) { // VoiceToTextInputOutput
        setInitialAdvice({
            gentleCoachAdvice: result.gentleCoachPerspective,
            noBsCoachAdvice: result.noBSCoachPerspective,
        });
    } else {
        console.error("Unexpected API response structure:", result);
        throw new Error(`Unknown API response structure. Expected properties not found. Received: ${JSON.stringify(result)}`);
    }
    setOriginalDilemma(dilemma);
    setViewMode("personaSelection");
  };


  const handleTextSubmit = async () => {
    if (!userInput.trim()) {
      setError("Please enter your dilemma.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setInitialAdvice(null); 
    setSelectedPersonaForChat(null);

    try {
      const result: GeneralAdviceOutput = await generalAdvice({ dilemma: userInput });
      
      // Add additional validation
      if (!result) {
        throw new Error("No response received from AI service");
      }
      
      processApiResponse(result, userInput);
    } catch (e) {
      console.error("Error generating advice:", e);
      setError("Failed to generate perspectives. Please try again.");
      toast({
        title: "Error",
        description: "Could not generate perspectives. Check console for details.",
        variant: "destructive",
      });
      setViewMode("input");
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
          // Check if stop was triggered by mode change or actual recording end
          // The 'event' here is a BlobEvent if stopped by MediaRecorder.stop() itself
          // but might be different if stopRecording was called manually without processing.
          // We rely on a flag or parameter to stopRecording if we shouldn't process.
          if (mediaRecorderRef.current && (mediaRecorderRef.current as MediaRecorder & { shouldProcess?: boolean }).shouldProcess !== false) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              if (!base64Audio) {
                setError("Failed to process audio. Please try again.");
                setIsGenerating(false);
                setViewMode("input");
                return;
              }
              
              try {
                // For voice, we'll use a placeholder dilemma text for now.
                // In a real scenario, the voice input itself would be transcribed first.
                // For this structure, we assume voiceToTextInput flow handles transcription and then perspective generation.
                const result: VoiceToTextInputOutput = await voiceToTextInput({ audioDataUri: base64Audio });
                processApiResponse(result, "Voice input (transcription will be part of AI's context)");
              } catch (e) {
                console.error("Error with voice input:", e);
                setError("Failed to process voice input. Please try again.");
                 toast({
                  title: "Voice Input Error",
                  description: "Could not process your voice input.",
                  variant: "destructive",
                });
                setViewMode("input");
              } finally {
                setIsGenerating(false);
              }
            };
             reader.onerror = () => {
              setError("Failed to read audio data.");
              setIsGenerating(false);
              setViewMode("input");
            };
          } else {
             // If shouldProcess is false, just reset UI state without AI call
            setIsGenerating(false);
          }
           // Clean up the custom flag
          if (mediaRecorderRef.current) {
            delete (mediaRecorderRef.current as MediaRecorder & { shouldProcess?: boolean }).shouldProcess;
          }
        };

        (mediaRecorderRef.current as MediaRecorder & { shouldProcess?: boolean }).shouldProcess = true; // Custom flag to control processing in onstop
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        setError(null);
        setInitialAdvice(null); 
        setSelectedPersonaForChat(null);
        setIsGenerating(true); 

        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prevTime) => {
            const newTime = prevTime + 100;
            if (newTime >= MAX_VOICE_DURATION_MS) {
              stopRecording(); // This will call mediaRecorderRef.current.stop()
            }
            return newTime;
          });
        }, 100);

      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
        setIsGenerating(false);
        setViewMode("input");
      }
    } else {
      setError("Audio recording is not supported by your browser.");
      setIsGenerating(false);
      setViewMode("input");
    }
  };

  const stopRecording = useCallback((processAudio = true) => {
    if (mediaRecorderRef.current && isRecording) {
      (mediaRecorderRef.current as MediaRecorder & { shouldProcess?: boolean }).shouldProcess = processAudio; // Set flag before stopping
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // If not processing audio (e.g. mode switch), set isGenerating to false immediately
      if (!processAudio) {
        setIsGenerating(false);
      }
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        stopRecording(false);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stopRecording]);

  useEffect(() => {
    if (activeInputMode === 'text' && isRecording) {
      stopRecording(false);
    }
  }, [activeInputMode, isRecording, stopRecording]);

  // Reset chat state when switching persona or resetting
  useEffect(() => {
    setChatMessages([]);
    setChatInput("");
    setIsCoachResponding(false);
  }, [selectedPersonaForChat, viewMode]);

  // Simulate coach response (replace with real API call as needed)
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = { sender: 'user' as ChatRole, text: chatInput };
    setChatMessages((msgs) => [...msgs, userMessage]);
    setIsCoachResponding(true);
    setChatInput("");
    try {
      const aiInput = {
        messages: [
          ...chatMessages.map(m => ({ role: m.sender as ChatRole, content: m.text })),
          { role: 'user' as ChatRole, content: chatInput }
        ],
        persona: selectedPersonaForChat as 'gentle' | 'no-bs',
      };
      const result = await coachChat(aiInput);
      setChatMessages((msgs) => [
        ...msgs,
        { sender: 'coach' as ChatRole, text: result.response }
      ]);
    } catch (e) {
      setChatMessages((msgs) => [
        ...msgs,
        { sender: 'coach' as ChatRole, text: 'Sorry, there was an error. Please try again.' }
      ]);
    } finally {
      setIsCoachResponding(false);
    }
  };

  const handleRate = (perspective: string, rating: "up" | "down") => {
    console.log(`Rated ${perspective}: ${rating}`);
    toast({
      title: "Feedback Received",
      description: `You rated ${perspective} as ${rating === "up" ? "Helpful" : "Not Helpful"}.`,
    });
  };

  const handlePersonaSelect = (persona: SelectedPersona) => {
    setSelectedPersonaForChat(persona);
    setViewMode("chatView");
  };

  const charCount = userInput.length;
  const remainingChars = MAX_TEXT_LENGTH - charCount;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      {viewMode !== "chatView" && (
        <Tabs value={activeInputMode} onValueChange={handleInputModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-primary/10">
            <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Text Input</TabsTrigger>
            <TabsTrigger value="voice" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Voice Input</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {viewMode === "input" && (
        <>
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
                    We&apos;ll transcribe it and provide perspectives for you.
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
               {isGenerating && !isRecording && viewMode === 'input' && (
                <div className="my-4 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="mt-2 text-muted-foreground">Processing your voice...</p>
                </div>
              )}
              <Button
                onClick={isRecording ? () => stopRecording() : startRecording}
                disabled={isGenerating && !isRecording}
                className={`w-full ${isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent hover:bg-accent/90'} text-accent-foreground`}
              >
                {isRecording ? <StopCircle className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                {isRecording ? "Stop Recording" : (isGenerating && viewMode === 'input' ? "Processing..." : "Start Recording")}
              </Button>
            </div>
          )}
        </>
      )}
      
      {isGenerating && viewMode === 'input' && activeInputMode === 'text' && (
         <div className="space-y-6 mt-8">
            <PerspectiveCard title="Gentle Coach" advice="" isLoading={true} onRate={() => {}} />
            <PerspectiveCard title="No-BS Coach" advice="" isLoading={true} onRate={() => {}} />
        </div>
      )}


      {viewMode === "personaSelection" && initialAdvice && (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline text-primary text-center">Choose a Perspective to Explore</h2>
          <p className="text-center text-muted-foreground mb-6">
            You shared: &quot;{originalDilemma.length > 100 ? originalDilemma.substring(0, 100) + "..." : originalDilemma}&quot;
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              onClick={() => handlePersonaSelect("gentle")}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out border-2 border-transparent hover:border-primary hover:-translate-y-1"
            >
              <CardHeader className="items-center">
                <MessageSquareHeart className="h-12 w-12 text-primary mb-2" />
                <CardTitle className="font-headline text-2xl text-primary">Gentle Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-foreground/80">
                  Empathetic, supportive guidance. Validates feelings and suggests small, manageable steps.
                </CardDescription>
              </CardContent>
            </Card>
            <Card
              onClick={() => handlePersonaSelect("no-bs")}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out border-2 border-transparent hover:border-primary hover:-translate-y-1"
            >
              <CardHeader className="items-center">
                <MessageSquareWarning className="h-12 w-12 text-primary mb-2" />
                <CardTitle className="font-headline text-2xl text-primary">No-BS Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-foreground/80">
                  Direct, actionable advice. Identifies cognitive traps and gives blunt, actionable strategies.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
           <Button variant="outline" onClick={resetToInputMode} className="w-full mt-6">
            Ask Something Else
          </Button>
        </div>
      )}

      {viewMode === "chatView" && initialAdvice && selectedPersonaForChat && (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setViewMode("personaSelection")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Perspectives
          </Button>
          {selectedPersonaForChat === "gentle" && (
            <>
              <PerspectiveCard
                title="Gentle Coach"
                advice={initialAdvice.gentleCoachAdvice}
                onRate={(rating) => handleRate("Gentle Coach", rating)}
              />
              {/* Gentle Coach Chatbox */}
              <div className="mt-6 bg-background/80 rounded-xl shadow-lg p-4 border border-border max-w-xl mx-auto">
                <div className="mb-4 max-h-60 overflow-y-auto space-y-2">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={msg.sender === 'user' ? 'text-right' : 'text-left'}
                    >
                      <span
                        className={
                          (msg.sender === 'user'
                            ? 'inline-block bg-primary/10 text-primary'
                            : 'inline-block bg-accent/10 text-accent') +
                          ' px-3 py-2 rounded-2xl mb-1 transition-all duration-300 ease-in-out animate-fadein'
                        }
                        style={{
                          willChange: 'transform, opacity',
                        }}
                      >
                        {msg.text}
                      </span>
                    </div>
                  ))}
                  {isCoachResponding && (
                    <div className="text-left">
                      <span className="inline-block bg-accent/10 text-accent px-3 py-2 rounded-2xl mb-1 animate-pulse">Gentle Coach is typing…</span>
                    </div>
                  )}
                </div>
                <form
                  className="flex items-center gap-2"
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                >
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type your message…"
                    className="shadow-input"
                    disabled={isCoachResponding}
                  />
                  <Button type="submit" disabled={!chatInput.trim() || isCoachResponding} className="bg-accent text-accent-foreground">
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          )}
          {selectedPersonaForChat === "no-bs" && (
            <>
              <PerspectiveCard
                title="No-BS Coach"
                advice={initialAdvice.noBsCoachAdvice}
                onRate={(rating) => handleRate("No-BS Coach", rating)}
              />
              {/* No-BS Coach Chatbox */}
              <div className="mt-6 bg-background/80 rounded-xl shadow-lg p-4 border border-border max-w-xl mx-auto">
                <div className="mb-4 max-h-60 overflow-y-auto space-y-2">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={msg.sender === 'user' ? 'text-right' : 'text-left'}
                    >
                      <span
                        className={
                          (msg.sender === 'user'
                            ? 'inline-block bg-primary/10 text-primary'
                            : 'inline-block bg-accent/10 text-accent') +
                          ' px-3 py-2 rounded-2xl mb-1 transition-all duration-300 ease-in-out animate-fadein'
                        }
                        style={{
                          willChange: 'transform, opacity',
                        }}
                      >
                        {msg.text}
                      </span>
                    </div>
                  ))}
                  {isCoachResponding && (
                    <div className="text-left">
                      <span className="inline-block bg-accent/10 text-accent px-3 py-2 rounded-2xl mb-1 animate-pulse">No-BS Coach is typing…</span>
                    </div>
                  )}
                </div>
                <form
                  className="flex items-center gap-2"
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                >
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type your message…"
                    className="shadow-input"
                    disabled={isCoachResponding}
                  />
                  <Button type="submit" disabled={!chatInput.trim() || isCoachResponding} className="bg-accent text-accent-foreground">
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
