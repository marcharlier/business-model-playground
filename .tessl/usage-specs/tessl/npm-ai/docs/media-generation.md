# Media Generation (Experimental)

Generate images, synthesize speech, and transcribe audio.

## Image Generation

```typescript
import { experimental_generateImage } from 'ai';

const { images } = await experimental_generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'A serene landscape',
  size: '1024x1024',
});

const image = images[0];
if (image.base64) {
  console.log('Base64:', image.base64);
} else if (image.url) {
  console.log('URL:', image.url);
}
```

## Speech Synthesis

```typescript
import { experimental_generateSpeech } from 'ai';

const { audio } = await experimental_generateSpeech({
  model: openai.speech('tts-1'),
  voice: 'alloy',
  text: 'Hello, this is a test',
});

// audio.uint8Array or audio.base64 available
```

## Audio Transcription

```typescript
import { experimental_transcribe } from 'ai';
import { readFile } from 'fs/promises';

const audioData = await readFile('./audio.mp3');

const { text, segments } = await experimental_transcribe({
  model: openai.transcription('whisper-1'),
  audio: audioData,
});

console.log('Transcription:', text);
if (segments) {
  segments.forEach(s => {
    console.log(`[${s.startSecond}s - ${s.endSecond}s]: ${s.text}`);
  });
}
```

## Type Reference

```typescript
interface Experimental_GenerateImageResult {
  images: Array<{
    base64?: string;
    uint8Array?: Uint8Array;
    url?: string;
    mediaType: string;
  }>;
  warnings?: CallWarning[];
}

interface Experimental_SpeechResult {
  audio: {
    base64?: string;
    uint8Array?: Uint8Array;
    mediaType: string;
    format: string;
  };
}

interface Experimental_TranscriptionResult {
  text: string;
  segments?: Array<{
    startSecond: number;
    endSecond: number;
    text: string;
  }>;
}
```

