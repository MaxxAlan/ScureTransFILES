
import React from 'react';
import type { AppFile, ProcessedFile } from '../types';
import { formatBytes } from '../utils/fileUtils';
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, ArrowDownCircleIcon, PencilIcon } from './Icons';
import { downloadBlob } from '../utils/fileProcessor';

interface FileItemProps {
    appFile: AppFile;
    processedFile: ProcessedFile | undefined;
    onRemove: (id: string) => void;
    onRename: (id: string, newFullName: string) => void;
    onToggle: (id: string) => void;
    isProcessing: boolean;
}

const FileItem: React.FC<FileItemProps> = ({ appFile, processedFile, onRemove, onRename, onToggle, isProcessing }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    
    const originalName = appFile.file.name;
    const originalExt = originalName.split('.').pop() ?? '';

    const getDisplayName = () => {
        if (appFile.customName) {
            return appFile.customExtension 
                ? `${appFile.customName}.${appFile.customExtension}` 
                : appFile.customName;
        }
        return originalName;
    };

    const displayName = getDisplayName();
    const [editedName, setEditedName] = React.useState(displayName);

    React.useEffect(() => {
        if (!isEditing) {
            setEditedName(getDisplayName());
        }
    }, [appFile.customName, appFile.customExtension, isEditing]);

    const handleSaveRename = () => {
        const trimmedName = editedName.trim();
        if (trimmedName && trimmedName !== displayName) {
            onRename(appFile.id, trimmedName);
        } else {
            // If name is unchanged or cleared, revert to original visual state
            setEditedName(displayName);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSaveRename();
        else if (e.key === 'Escape') {
            setEditedName(displayName);
            setIsEditing(false);
        }
    };

    const getStatusIcon = () => {
        switch (appFile.status) {
            case 'queued': return <ClockIcon className="w-5 h-5 text-gray-400" />;
            case 'processing': case 'encrypting': case 'zipping': return <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>;
            case 'done': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'error': return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    return (
        <li className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-all duration-300">
            <div className="flex items-center space-x-3">
                 <input 
                    type="checkbox"
                    checked={appFile.isSelected ?? false}
                    onChange={() => onToggle(appFile.id)}
                    disabled={isProcessing}
                    className="h-4 w-4 flex-shrink-0 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-900"
                />
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{getStatusIcon()}</div>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleSaveRename}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    ) : (
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={displayName}>
                           {displayName}
                        </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(appFile.file.size)}</p>
                </div>
                {processedFile ? (
                     <button
                        onClick={() => downloadBlob(processedFile.blob, processedFile.newName)}
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                        aria-label="Download file"
                     >
                        <ArrowDownCircleIcon className="w-6 h-6" />
                     </button>
                ) : (
                    <div className="flex items-center space-x-1">
                        {!isProcessing && !isEditing && (
                             <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label="Rename file"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => onRemove(appFile.id)}
                            disabled={isProcessing}
                            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Remove file"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
            {(appFile.status === 'processing' || appFile.status === 'encrypting') && (
                <div className="mt-2 ml-12 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${appFile.progress}%` }}></div>
                </div>
            )}
            {appFile.status === 'error' && <p className="text-xs text-red-500 mt-1 ml-12">{appFile.log}</p>}
        </li>
    );
};


interface FileListProps {
    files: AppFile[];
    processedFiles: ProcessedFile[];
    onRemoveFile: (id: string) => void;
    onRenameFile: (id: string, newFullName: string) => void;
    onToggleSelection: (id: string) => void;
    onSelectAll: (select: boolean) => void;
    onRemoveSelected: () => void;
    isProcessing: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, processedFiles, onRemoveFile, onRenameFile, onToggleSelection, onSelectAll, onRemoveSelected, isProcessing }) => {
    const selectedCount = files.filter(f => f.isSelected).length;
    const allSelected = files.length > 0 && selectedCount === files.length;
    const someSelected = selectedCount > 0 && !allSelected;

    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = someSelected;
        }
    }, [someSelected]);
    
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">File Queue</h2>
                {selectedCount > 0 && (
                    <button
                        onClick={onRemoveSelected}
                        disabled={isProcessing}
                        className="text-sm font-medium text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Remove Selected ({selectedCount})
                    </button>
                )}
            </div>
             <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <input
                    ref={checkboxRef}
                    id="select-all"
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    disabled={isProcessing || files.length === 0}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="select-all" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedCount} / {files.length} selected
                </label>
            </div>
            <ul className="space-y-3">
                {files.map(appFile => (
                    <FileItem
                        key={appFile.id}
                        appFile={appFile}
                        processedFile={processedFiles.find(pf => pf.id === appFile.id)}
                        onRemove={onRemoveFile}
                        onRename={onRenameFile}
                        onToggle={onToggleSelection}
                        isProcessing={isProcessing}
                    />
                ))}
            </ul>
        </div>
    );
};