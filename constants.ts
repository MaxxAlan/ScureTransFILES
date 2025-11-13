
import type { FileCategory } from './types';

export const SUPPORTED_FORMATS: Record<FileCategory, { value: string; label: string }[]> = {
    image: [
        { value: 'jpg', label: 'JPG' },
        { value: 'png', label: 'PNG' },
        { value: 'webp', label: 'WebP' },
        { value: 'gif', label: 'GIF' },
    ],
    video: [
        { value: 'mp4', label: 'MP4' },
        { value: 'webm', label: 'WebM' },
        { value: 'gif', label: 'Animated GIF' },
    ],
    audio: [
        { value: 'mp3', label: 'MP3' },
        { value: 'wav', label: 'WAV' },
        { value: 'ogg', label: 'OGG' },
    ],
    document: [
        { value: 'pdf', label: 'PDF' },
        { value: 'txt', label: 'Text' },
    ],
    general: [],
};
