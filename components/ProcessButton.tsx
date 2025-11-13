
import React from 'react';
import type { AppFile, ProcessedFile } from '../types';
import { PlayIcon, ArrowDownTrayIcon, ArchiveBoxArrowDownIcon } from './Icons';
import { downloadBlob, zipFiles } from '../utils/fileProcessor';

declare const JSZip: any;

interface ProcessButtonProps {
    onClick: () => void;
    isProcessing: boolean;
    hasFiles: boolean;
    selectedFilesCount: number;
    processedFiles: ProcessedFile[];
}

export const ProcessButton: React.FC<ProcessButtonProps> = ({ onClick, isProcessing, hasFiles, selectedFilesCount, processedFiles }) => {

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const createdFolders = new Set<string>();

        for (const file of processedFiles) {
            const pathParts = file.originalPath.split('/').filter(p => p);
            let currentFolder = zip;
            
            if (pathParts.length > 1) {
                for (let i = 0; i < pathParts.length - 1; i++) {
                    const folderName = pathParts[i];
                    const folderPath = pathParts.slice(0, i + 1).join('/');
                    if (!createdFolders.has(folderPath)) {
                        currentFolder = currentFolder.folder(folderName);
                        createdFolders.add(folderPath);
                    } else {
                        currentFolder = currentFolder.folder(folderName);
                    }
                }
            }
            
            currentFolder.file(file.newName, file.blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, 'SecureTrans_Archive.zip');
    };

    if (processedFiles.length > 0) {
        if (processedFiles.length > 1) {
            return (
                <button
                    onClick={handleDownloadAll}
                    className="w-full flex items-center justify-center text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-lg px-5 py-4 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 transition-colors"
                >
                    <ArchiveBoxArrowDownIcon className="w-6 h-6 mr-2" />
                    Download All as .ZIP
                </button>
            );
        }
        if (processedFiles.length === 1) {
            return (
                 <button
                    onClick={() => downloadBlob(processedFiles[0].blob, processedFiles[0].newName)}
                    className="w-full flex items-center justify-center text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-lg px-5 py-4 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 transition-colors"
                >
                    <ArrowDownTrayIcon className="w-6 h-6 mr-2" />
                    Download File
                </button>
            )
        }
    }
    
    const buttonText = selectedFilesCount > 0 
        ? `Start Conversion (${selectedFilesCount} ${selectedFilesCount > 1 ? 'files' : 'file'})` 
        : 'Select Files to Convert';

    return (
        <button
            onClick={onClick}
            disabled={isProcessing || !hasFiles || selectedFilesCount === 0}
            className="w-full flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-lg px-5 py-4 text-center dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isProcessing ? (
                <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Processing...
                </>
            ) : (
                <>
                    <PlayIcon className="w-6 h-6 mr-2" />
                    {buttonText}
                </>
            )}
        </button>
    );
};