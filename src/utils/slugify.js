/**
 * Converts a string into a URL-friendly slug.
 * @param {string} text - The text to slugify.
 * @returns {string} - The slugified text.
 */
export const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};
