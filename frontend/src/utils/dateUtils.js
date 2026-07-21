/**
 * Formats a time string (HH:MM:SS or YYYY-MM-DD HH:MM:SS) into HH:MM with customizable separator.
 * 
 * @param {string} timeStr 
 * @param {string} separator 
 * @returns {string}
 */
export const formatTime = (timeStr, separator = ':') => {
    if (!timeStr) return "";
    const timePart = timeStr.includes(" ") ? timeStr.split(" ")[1] : timeStr;
    return timePart.split(":").slice(0, 2).join(separator);
};
