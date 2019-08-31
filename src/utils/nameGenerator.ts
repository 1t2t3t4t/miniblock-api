import randomValue from "./randomizer";
import stringGenerator from "./stringGenerator";

const names = [
    "Shanel",
    "Octavio",
    "Afton",
    "Marilynn",
    "Sharyl",
    "Elsy",
    "Alesia",
    "Laveta",
    "Sabina",
    "Michael"
]

export default function randomName() {
    return randomValue(names) + ' ' + randomValue(names) + ' ' + stringGenerator(3)
}

console.log(randomName())