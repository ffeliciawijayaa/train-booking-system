import { useState } from 'react';

/**
 * Custom hook for copying text to clipboard with a temporary copied state.
 * 
 * @param {number} timeout 
 * @returns {{ copiedText: string, handleCopy: (text: string) => void }}
 */
export const useClipboard = (timeout = 2000) => {
    const [copiedText, setCopiedText] = useState('');

    const handleCopy = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }
        setCopiedText(text);
        setTimeout(() => setCopiedText(''), timeout);
    };

    return { copiedText, handleCopy };
};

export default useClipboard;
