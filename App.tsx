
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { FileList } from './components/FileList';
import { ConversionOptionsPanel } from './components/ConversionOptionsPanel';
import { LogPanel } from './components/LogPanel';
import { ProcessButton } from './components/ProcessButton';
import { useFileProcessor } from './hooks/useFileProcessor';
import type { AppFile, ConversionOptions } from './types';
import { getFileCategory } from './utils/fileUtils';
import { applyRenamePattern } from './utils/renameHelper';

const App: React.FC = () => {
    const [files, setFiles] = useState<AppFile[]>([]);
    const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
        targetFormat: 'default',
        renamePrefix: '',
        renameSuffix: '',
        encryption: {
            enabled: false,
            password: '',
        },
    });

    const { processedFiles, logs, isProcessing, processFiles, clearProcessor } = useFileProcessor();

    const handleFilesAdded = useCallback((addedFiles: File[]) => {
        const newAppFiles: AppFile[] = addedFiles.map((file, index) => ({
            id: `${file.name}-${file.lastModified}-${index}`,
            file,
            status: 'queued',
            progress: 0,
            originalPath: (file as any).webkitRelativePath || file.name,
            isSelected: true, // Select files by default on upload
        }));
        
        clearProcessor();
        setFiles(newAppFiles);
    }, [clearProcessor]);

    const handleRemoveFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);
    
    const handleRenameFile = useCallback((fileId: string, newFullName: string) => {
        setFiles(prev => prev.map(f => {
            if (f.id === fileId) {
                const newFile = { ...f };
                const trimmedName = newFullName.trim();
                
                if (!trimmedName || trimmedName === f.file.name) {
                    delete newFile.customName;
                    delete newFile.customExtension;
                    return newFile;
                }

                const lastDotIndex = trimmedName.lastIndexOf('.');
                if (lastDotIndex > 0) {
                    newFile.customName = trimmedName.substring(0, lastDotIndex);
                    newFile.customExtension = trimmedName.substring(lastDotIndex + 1);
                } else {
                    newFile.customName = trimmedName;
                    delete newFile.customExtension;
                }
                return newFile;
            }
            return f;
        }));
    }, []);

    const handleToggleSelection = useCallback((fileId: string) => {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isSelected: !f.isSelected } : f));
    }, []);

    const handleSelectAll = useCallback((select: boolean) => {
        setFiles(prev => prev.map(f => ({ ...f, isSelected: select })));
    }, []);

    const handleRemoveSelected = useCallback(() => {
        const selectedCount = files.filter(f => f.isSelected).length;
        if (selectedCount > 0 && window.confirm(`Are you sure you want to remove ${selectedCount} selected file(s)?`)) {
            setFiles(prev => prev.filter(f => !f.isSelected));
        }
    }, [files]);

    const handleBatchRename = useCallback((pattern: string) => {
        let index = 1;
        const newFiles = files.map(f => {
            if (f.isSelected) {
                const newFullName = applyRenamePattern(pattern, f, index);
                index++;
                
                const lastDotIndex = newFullName.lastIndexOf('.');
                if (lastDotIndex > 0) { // check for > 0 to not match dotfiles like .env
                    return { 
                        ...f, 
                        customName: newFullName.substring(0, lastDotIndex),
                        customExtension: newFullName.substring(lastDotIndex + 1)
                    };
                }
                // No extension in pattern, just update base name
                return { ...f, customName: newFullName, customExtension: undefined };
            }
            return f;
        });
        setFiles(newFiles);
    }, [files]);

    const handleProcess = useCallback(async () => {
        const selectedFiles = files.filter(f => f.isSelected);
        if (selectedFiles.length === 0) {
            alert("Please select at least one file to process.");
            return;
        }
        await processFiles(selectedFiles, conversionOptions);
    }, [files, conversionOptions, processFiles]);
    
    const hasFiles = files.length > 0;
    const selectedFilesCount = files.filter(f => f.isSelected).length;
    const fileCategory = hasFiles ? getFileCategory(files[0].file.type) : 'general';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <UploadZone onFilesAdded={handleFilesAdded} isProcessing={isProcessing} />
                        {hasFiles && (
                            <FileList 
                                files={files} 
                                processedFiles={processedFiles} 
                                onRemoveFile={handleRemoveFile} 
                                onRenameFile={handleRenameFile} 
                                isProcessing={isProcessing}
                                onToggleSelection={handleToggleSelection}
                                onSelectAll={handleSelectAll}
                                onRemoveSelected={handleRemoveSelected}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <ConversionOptionsPanel
                            options={conversionOptions}
                            // FIX: Pass the correct state setter `setConversionOptions` instead of `setOptions`.
                            setOptions={setConversionOptions}
                            isDisabled={isProcessing || !hasFiles}
                            fileCategory={fileCategory}
                            onBatchRename={handleBatchRename}
                            selectedFilesCount={selectedFilesCount}
                        />
                        <ProcessButton 
                            onClick={handleProcess} 
                            isProcessing={isProcessing} 
                            hasFiles={hasFiles}
                            selectedFilesCount={selectedFilesCount}
                            processedFiles={processedFiles}
                         />
                    </div>
                </div>
                 {logs.length > 0 && <LogPanel logs={logs} />}
            </main>
            <footer className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
                <p>&copy; 2024 SecureTrans. All processing is done locally in your browser.</p>
            </footer>
        </div>
    );
};

export default App;