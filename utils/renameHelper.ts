import type { AppFile } from '../types';

/**
 * Applies a renaming pattern to generate a new base name for a file.
 * Supports placeholders: {name}, {i} or {index} (with optional padding, e.g., {i:3}), {date}, {time}.
 * @param pattern - The pattern string (e.g., "image-{i:3}-{date}").
 * @param file - The AppFile object.
 * @param index - The sequential index for the {i}/{index} placeholder.
 * @returns The new full name, potentially including an extension.
 */
export function applyRenamePattern(pattern: string, file: AppFile, index: number): string {
    const originalName = file.file.name;
    const baseName = originalName.includes('.') ? originalName.substring(0, originalName.lastIndexOf('.')) : originalName;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    let newName = pattern
        .replace(/\{name\}/g, baseName)
        // Regex to find {i} or {index} with optional padding like {i:3}
        .replace(/\{(i|index)(?::(\d+))?\}/g, (match, key, padding) => {
            const paddingLength = padding ? parseInt(padding, 10) : 1;
            return String(index).padStart(paddingLength, '0');
        })
        .replace(/\{date\}/g, `${year}-${month}-${day}`)
        .replace(/\{time\}/g, `${hours}-${minutes}-${seconds}`);

    // Sanitize filename to remove characters that are invalid in most filesystems
    newName = newName.replace(/[<>:"/\\|?*]/g, '_');

    return newName;
}