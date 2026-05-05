export function stringToColor(s: string) {
    let hash = 0
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
    let color = '#'
    for (let i = 0; i < 3; i++) color += `00${((hash >> (i * 8)) & 0xff).toString(16)}`.slice(-2)
    return color
}

export function initials(name: string) {
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
}
