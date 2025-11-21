/**
 * Generate initials from a name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
export function getInitials(name) {
    if (!name) return '??';

    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color based on a string
 * @param {string} str - Input string (usually a name)
 * @returns {string} - HSL color string
 */
export function getColorFromString(str) {
    if (!str) return 'hsl(200, 70%, 50%)';

    // Generate hash from string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hue (0-360)
    const hue = Math.abs(hash % 360);

    // Use vibrant colors with good saturation and lightness
    return `hsl(${hue}, 70%, 55%)`;
}

/**
 * Generate avatar data for a contact
 * @param {string} name - Contact name
 * @returns {object} - Avatar data with initials and color
 */
export function generateAvatar(name) {
    return {
        initials: getInitials(name),
        color: getColorFromString(name)
    };
}
