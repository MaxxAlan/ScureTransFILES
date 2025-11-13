
export type FileStatus = 'queued' | 'processing' | 'encrypting' | 'zipping' | 'done' | 'error';

export type FileCategory = 'image' | 'audio' | 'video' | 'document' | 'general';

export interface AppFile {
    id: string;
    file: File;
    status: FileStatus;
    progress: number;
    log?: string;
    originalPath: string;
    customName?: string;
    customExtension?: string;
    isSelected?: boolean;
}

export interface ProcessedFile {
    id: string;
    originalName: string;
    newName: string;
    blob: Blob;
    originalPath: string;
}

export interface EncryptionOptions {
    enabled: boolean;
    password: string;
}

export interface ConversionOptions {
    targetFormat: string;
    renamePrefix: string;
    renameSuffix: string;
    encryption: EncryptionOptions;
}