import React from 'react';
import type { ConversionOptions, FileCategory } from '../types';
import { SUPPORTED_FORMATS } from '../constants';

interface ConversionOptionsPanelProps {
    options: ConversionOptions;
    setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
    isDisabled: boolean;
    fileCategory: FileCategory;
    onBatchRename: (pattern: string) => void;
    selectedFilesCount: number;
}

export const ConversionOptionsPanel: React.FC<ConversionOptionsPanelProps> = ({ options, setOptions, isDisabled, fileCategory, onBatchRename, selectedFilesCount }) => {
    const [renamePattern, setRenamePattern] = React.useState('{name}-{i:3}');
    
    const handleOptionChange = (field: keyof ConversionOptions, value: any) => {
        setOptions(prev => ({ ...prev, [field]: value }));
    };

    const handleEncryptionChange = (field: keyof ConversionOptions['encryption'], value: any) => {
        setOptions(prev => ({
            ...prev,
            encryption: { ...prev.encryption, [field]: value }
        }));
    };
    
    const handleApplyPattern = () => {
        if (selectedFilesCount > 0) {
            onBatchRename(renamePattern);
        }
    };

    const previewText = `Preview: ${renamePattern
        .replace(/\{name\}/g, 'filename')
        .replace(/\{(i|index)(?::(\d+))?\}/g, (match, key, padding) => {
             const paddingLength = padding ? parseInt(padding, 10) : 1;
             return String(1).padStart(paddingLength, '0');
        })
    }`;

    const availableFormats = SUPPORTED_FORMATS[fileCategory] || [];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversion Settings</h2>

            {/* Target Format */}
            <div className="space-y-2">
                <label htmlFor="targetFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Format</label>
                <select
                    id="targetFormat"
                    value={options.targetFormat}
                    onChange={(e) => handleOptionChange('targetFormat', e.target.value)}
                    disabled={isDisabled || availableFormats.length === 0}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 disabled:opacity-50"
                >
                    <option value="default">Keep Original</option>
                    {availableFormats.map(format => (
                        <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                </select>
            </div>

            {/* Renaming */}
            <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Rename Files (Prefix/Suffix)</h3>
                <div className="space-y-2">
                    <label htmlFor="renamePrefix" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prefix</label>
                    <input
                        type="text"
                        id="renamePrefix"
                        placeholder="e.g., converted-"
                        value={options.renamePrefix}
                        onChange={(e) => handleOptionChange('renamePrefix', e.target.value)}
                        disabled={isDisabled}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 disabled:opacity-50"
                    />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="renameSuffix" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suffix</label>
                    <input
                        type="text"
                        id="renameSuffix"
                        placeholder="e.g., -final"
                        value={options.renameSuffix}
                        onChange={(e) => handleOptionChange('renameSuffix', e.target.value)}
                        disabled={isDisabled}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 disabled:opacity-50"
                    />
                </div>
            </div>

             {/* Batch Rename */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Batch Rename Selected Files</h3>
                 <div className="space-y-2">
                    <label htmlFor="renamePattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Renaming Pattern
                    </label>
                    <input
                        type="text"
                        id="renamePattern"
                        value={renamePattern}
                        onChange={(e) => setRenamePattern(e.target.value)}
                        disabled={isDisabled}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded-sm">{'{name}'}</code>, <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded-sm">{'{i}'}</code> (e.g., <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded-sm">{'{i:3}'}</code> for 001).
                        <br/>Include an extension (e.g., <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded-sm">.webp</code>) to override target format.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{previewText}</p>
                </div>
                <button
                    onClick={handleApplyPattern}
                    disabled={isDisabled || selectedFilesCount === 0}
                    className="w-full text-sm text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900/80 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Apply Pattern to {selectedFilesCount} Selected
                </button>
            </div>

            {/* Encryption */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <input
                        id="enableEncryption"
                        type="checkbox"
                        checked={options.encryption.enabled}
                        onChange={(e) => handleEncryptionChange('enabled', e.target.checked)}
                        disabled={isDisabled}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="enableEncryption" className="ml-2 text-md font-semibold text-gray-800 dark:text-gray-200">Encrypt Output (AES-256)</label>
                </div>
                {options.encryption.enabled && (
                    <div className="space-y-2">
                        <label htmlFor="encryptionPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                         <input
                            type="password"
                            id="encryptionPassword"
                            placeholder="Enter a strong password"
                            value={options.encryption.password}
                            onChange={(e) => handleEncryptionChange('password', e.target.value)}
                            disabled={isDisabled}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 disabled:opacity-50"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};