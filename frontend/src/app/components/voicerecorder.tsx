'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';

const VoiceRecorder: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            setTranscript(null);
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);
                uploadAudio(audioBlob);
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            setError('Microphone access denied or error starting recorder.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const uploadAudio = async (blob: Blob) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
            const response = await axios.post('http://localhost:8000/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setTranscript(response.data.text);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Transcription failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Record Voice</h2>

            <div className="flex justify-center gap-4">
                <button
                    onClick={startRecording}
                    disabled={recording}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                    Start Recording
                </button>
                <button
                    onClick={stopRecording}
                    disabled={!recording}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                    Stop Recording
                </button>
            </div>

            {loading && (
                <div className="mt-4 text-center text-blue-600 font-semibold">Transcribing...</div>
            )}

            {audioURL && (
                <div className="mt-4">
                    <audio controls src={audioURL} className="w-full" />
                </div>
            )}

            {transcript && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded border border-green-300">
                    <strong>Transcript:</strong>
                    <p className="mt-2 whitespace-pre-wrap">{transcript}</p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
