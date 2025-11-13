
import type { AppFile, ConversionOptions, ProcessedFile } from '../types';

// Declare global libraries loaded from CDN
declare const CryptoJS: any;
declare const JSZip: any;
declare const imageCompression: any;
declare const PDFLib: any;

/**
 * Converts a file based on its type and target format.
 * This function simulates complex conversions (video/audio) and uses real libraries for images/documents.
 */
export async function convertFile(
    appFile: AppFile, 
    options: ConversionOptions, 
    onProgress: (progress: number) => void
): Promise<Blob> {
    const { file } = appFile;
    const { targetFormat } = options;
    const originalType = file.type.split('/')[0];

    onProgress(10);

    if (targetFormat === 'default') {
        onProgress(100);
        return file;
    }
    
    // Image Conversion
    if (originalType === 'image') {
        const imageFile = file;
        const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: `image/${targetFormat}`,
        };
        onProgress(30);
        const compressedFile = await imageCompression(imageFile, compressionOptions);
        onProgress(100);
        return compressedFile;
    }

    // Document Conversion (TXT to PDF)
    if (file.type === 'text/plain' && targetFormat === 'pdf') {
        onProgress(30);
        const text = await file.text();
        const pdfDoc = await PDFLib.PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText(text, { x: 50, y: page.getHeight() - 50, size: 12 });
        onProgress(80);
        const pdfBytes = await pdfDoc.save();
        onProgress(100);
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }

    // MOCK: Video/Audio conversion simulation (ffmpeg.wasm would go here)
    if (originalType === 'video' || originalType === 'audio') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        onProgress(50);
        await new Promise(resolve => setTimeout(resolve, 2000));
        onProgress(100);
        const mockContent = `This is a mock converted file: ${file.name} to ${targetFormat}`;
        return new Blob([mockContent], { type: `${originalType}/${targetFormat}` });
    }

    // Fallback for unsupported conversions
    onProgress(100);
    return file; 
}


/**
 * Encrypts a Blob using AES-256 with a given password.
 */
export async function encryptFile(blob: Blob, password: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const wordArray = CryptoJS.lib.WordArray.create(reader.result);
                const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
                resolve(new Blob([encrypted]));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

/**
 * Creates a ZIP archive from multiple processed files and triggers a download.
 */
export async function zipFiles(processedFiles: ProcessedFile[], zipFileName: string): Promise<void> {
    const zip = new JSZip();
    
    // Use a Set to track folder paths to avoid creating them multiple times
    const createdFolders = new Set<string>();

    for (const file of processedFiles) {
        const pathParts = file.originalPath.split('/').filter(p => p);
        let currentFolder = zip;
        
        // Create nested folders if they exist
        if (pathParts.length > 1) {
            for (let i = 0; i < pathParts.length - 1; i++) {
                const folderName = pathParts[i];
                const folderPath = pathParts.slice(0, i + 1).join('/');
                if (!createdFolders.has(folderPath)) {
                    currentFolder = currentFolder.folder(folderName);
                    createdFolders.add(folderPath);
                }
            }
        }
        
        // Add the file to the correct folder in the zip
        currentFolder.file(file.newName, file.blob);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    // This part is handled by the ProcessButton now to give user control
    // downloadBlob(zipBlob, zipFileName);
}

/**
 * Triggers a browser download for a given Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
