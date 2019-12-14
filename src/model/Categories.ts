import {isNullOrUndefined, isNumber} from "util";

export class CategoryModel {
    id: number
    name: string
    iconURL: string = "nothing for you now, boi"

    constructor(id: number, name: string) {
        this.id = id
        this.name = name
    }
}

export enum Category {
    Loneliness = "Loneliness",
    SocialProblems = "SocialProblems",
    Relationships = "Relationships",
    Depression = "Depression"
}

const isNumeric = (obj: any) => {
    return !isNullOrUndefined(obj) && !isNaN(Number(obj))
}

const list = Object.entries(Category)
    .filter((cat) => isNumeric(cat[0]))
    .map((cat) => new CategoryModel(Number(cat[0]), cat[1]))

export default list
