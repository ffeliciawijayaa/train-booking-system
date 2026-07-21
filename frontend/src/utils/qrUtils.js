/**
 * Generates a QR Code image URL via qrserver API.
 * 
 * @param {string} data 
 * @param {string} size 
 * @returns {string}
 */
export const getQrCodeUrl = (data, size = '150x150') => {
    if (!data) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${data}`;
};
