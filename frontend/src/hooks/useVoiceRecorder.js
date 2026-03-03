import { useState, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const useVoiceRecorder = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err.name === 'NotAllowedError') toast.error('Microphone access denied. Allow it in browser settings.');
      else if (err.name === 'NotFoundError') toast.error('No microphone found. Please connect one.');
      else toast.error('Microphone error: ' + err.message);
      return;
    }

    chunksRef.current = [];

    const mimeType = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ].find(t => MediaRecorder.isTypeSupported(t)) || '';

    let recorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    } catch (err) {
      toast.error('Could not start recorder: ' + err.message);
      stream.getTracks().forEach(t => t.stop());
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());

      const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });

      if (blob.size < 1000) {
        toast.error('Recording too short. Please try again.');
        setIsTranscribing(false);
        return;
      }

      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        // ✅ Delete the default Content-Type so axios sets it correctly
        // with the multipart boundary included automatically
        const res = await api.post('/api/interviews/transcribe', formData, {
          headers: {
            'Content-Type': undefined,
          },
          transformRequest: (data, headers) => {
            delete headers['Content-Type'];
            return data;
          },
        });

        const text = res.data.text?.trim();
        if (text) {
          onTranscript(text);
          toast.success('Transcription done!');
        } else {
          toast.error('No speech detected in recording.');
        }
      } catch (e) {
        toast.error('Transcription failed: ' + e.message);
      } finally {
        setIsTranscribing(false);
      }
    };

    recorder.onerror = () => {
      toast.error('Recording error. Please try again.');
      setIsRecording(false);
      stream.getTracks().forEach(t => t.stop());
      recorderRef.current = null;
    };

    recorderRef.current = recorder;
    recorder.start(250);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return { isRecording, isTranscribing, toggleRecording, stopRecording };
};

export default useVoiceRecorder;