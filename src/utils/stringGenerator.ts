
export default function stringGenerator(length: number): string {
    let str = ''
    for(let i=0;i<length;i++) {
        const char = Math.floor(Math.random() * 26) + 65
        let genChar = String.fromCharCode(char)

        if (Math.random() <= 0.5) {
            genChar = genChar.toLowerCase()
        }
        str += genChar
    }

    return str
}
