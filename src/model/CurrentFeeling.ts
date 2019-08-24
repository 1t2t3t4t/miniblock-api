import {isNullOrUndefined, isNumber} from "util";

export class CurrentFeelingModel {
    id: number
    name: string
    iconURL: string = "nothing for you now, boi"

    constructor(id: number, name: string) {
        this.id = id
        this.name = name
    }
}

export enum CurrentFeeling {
    Loneliness = 1,
    SocialProblems,
    Relationships,
    Depression
}

const isNumeric = (obj: any) => {
    return !isNullOrUndefined(obj) && !isNaN(Number(obj))
}

const list = Object.entries(CurrentFeeling)
    .filter((cat) => isNumeric(cat[0]))
    .map((cat) => new CurrentFeelingModel(Number(cat[0]), cat[1]))

export default list
