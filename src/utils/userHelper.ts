
export function anonymousDisplayName(displayName: string): string {
    const lowercasedName = displayName.toLowerCase()
    if (displayName.length == 1) {
        return 'xxxxx'
    } else {
        return lowercasedName.charAt(0) + 'xxx' + lowercasedName.charAt(lowercasedName.length - 1)
    }
}