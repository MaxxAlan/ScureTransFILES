
import React, { useCallback, useRef, useState } from 'react';
import { UploadIcon } from './Icons';

interface UploadZoneProps {
    onFilesAdded: (files: File[]) => void;
    isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesAdded, isProcessing }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesAdded(Array.from(event.target.files));
        }
    };
    
    const openFileDialog = () => fileInputRef.current?.click();
    const openFolderDialog = () => folderInputRef.current?.click();

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesAdded(Array.from(e.dataTransfer.files));
        }
    }, [onFilesAdded]);

    const baseClasses = "border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 cursor-pointer";
    const inactiveClasses = "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500";
    const activeClasses = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
    
    return (
        <div 
            className={`${baseClasses} ${isDragActive ? activeClasses : inactiveClasses}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple disabled={isProcessing} />
            {/* FIX: The 'webkitdirectory' attribute is non-standard and not in React's default TypeScript types. Using a spread object to pass it bypasses the type check. */}
            <input type="file" ref={folderInputRef} onChange={handleFileChange} className="hidden" multiple disabled={isProcessing} {...{webkitdirectory: ""}} />
            
            <div className="flex flex-col items-center justify-center space-y-4 text-gray-500 dark:text-gray-400">
                <UploadIcon className="w-12 h-12" />
                <p className="font-semibold">Drag & drop files here, or click to select</p>
                <p className="text-sm">Or <button type="button" onClick={(e) => { e.stopPropagation(); openFolderDialog(); }} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none">upload a folder</button></p>
            </div>
        </div>
    );
};
