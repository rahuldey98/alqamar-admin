/**
 * Mirrors the backend formula used to generate a user's initial password.
 * base = first 4 chars of name (lowercase, no spaces) + "123"
 */
export const createDefaultPassword = (name: string): string => {
    const base = name.trim().toLowerCase().replace(/\s+/g, '').slice(0, 4)
    return `${base || 'user'}123`
}
