
import { useState, useCallback } from 'react';
import type { AppFile, ConversionOptions, ProcessedFile } from '../types';
import { convertFile, encryptFile, zipFiles } from '../utils/fileProcessor';

export const useFileProcessor = () => {
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const addLog = useCallback((message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    }, []);

    const processFiles = useCallback(async (files: AppFile[], options: ConversionOptions) => {
        setIsProcessing(true);
        addLog('Starting file processing...');
        const newProcessedFiles: ProcessedFile[] = [];

        for (const appFile of files) {
            try {
                // Update status for UI
                appFile.status = 'processing';

                addLog(`Processing ${appFile.file.name}...`);
                const convertedBlob = await convertFile(appFile, options, (progress) => {
                    appFile.progress = progress;
                });
                addLog(`Converted ${appFile.file.name}.`);

                appFile.progress = 100;

                const originalName = appFile.file.name;
                const originalExtension = originalName.split('.').pop() ?? '';
                const originalBaseName = originalName.includes('.') ? originalName.substring(0, originalName.lastIndexOf('.')) : originalName;

                // Determine base name: custom name or original
                const baseName = appFile.customName || originalBaseName;

                // Apply prefix and suffix
                const finalBaseName = `${options.renamePrefix}${baseName}${options.renameSuffix}`;

                // Determine extension: custom extension > target format > original
                const extension = appFile.customExtension 
                    ?? (options.targetFormat !== 'default' ? options.targetFormat : originalExtension);

                let newName = extension ? `${finalBaseName}.${extension}` : finalBaseName;
                
                let finalBlob = convertedBlob;
                
                if (options.encryption.enabled) {
                    appFile.status = 'encrypting';
                    addLog(`Encrypting ${newName}...`);
                    finalBlob = await encryptFile(convertedBlob, options.encryption.password);
                    newName += '.enc';
                    addLog(`Encrypted ${newName}.`);
                }

                newProcessedFiles.push({
                    id: appFile.id,
                    originalName: appFile.file.name,
                    newName,
                    blob: finalBlob,
                    originalPath: appFile.originalPath,
                });

                appFile.status = 'done';
            } catch (error) {
                appFile.status = 'error';
                const errorMessage = error instanceof Error ? error.message : String(error);
                appFile.log = errorMessage;
                addLog(`Error processing ${appFile.file.name}: ${errorMessage}`);
            }
        }
        
        setProcessedFiles(newProcessedFiles);
        addLog('All files processed.');

        if (newProcessedFiles.length > 1) {
             addLog('Creating ZIP archive...');
             await zipFiles(newProcessedFiles, 'SecureTrans_Archive.zip');
             addLog('ZIP archive ready for download.');
        }

        setIsProcessing(false);
    }, [addLog]);

    const clearProcessor = useCallback(() => {
        setProcessedFiles([]);
        setLogs([]);
        setIsProcessing(false);
    }, []);

    return { processedFiles, logs, isProcessing, processFiles, clearProcessor };
};