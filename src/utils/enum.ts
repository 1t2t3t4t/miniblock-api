import {isNullOrUndefined} from "util";

export function toEnumArray<T extends string | number>(e: object): T[] {
    return Object.entries(e)
        .filter((v, i, a) => !isNumeric(v[0]))
        .map((v) => v[1] as T)
}

const isNumeric = (obj: any) => {
    return !isNullOrUndefined(obj) && !isNaN(Number(obj))
}