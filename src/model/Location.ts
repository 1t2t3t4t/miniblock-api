import mongoose from 'mongoose'
import {toEnumArray} from "../utils/enum";

export type Longitude = number
export type Latitude = number
export type Coordinates = [Longitude, Latitude]

export interface LocationModel {
    coordinates: Coordinates
}

export enum LocationType {
    POINT = 'Point'
}

function validateCoordinates(this: LocationModel, coordinates: Coordinates): boolean {
    let long = coordinates[0]
    let lat = coordinates[1]
    return long >= -180 && long <=180 && lat >= -90 && lat <= 90
}

const Location = new mongoose.Schema({
    type: {
        type: String,
        enum: toEnumArray(LocationType),
        default: LocationType.POINT
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
            validator: validateCoordinates,
            msg: 'Invalid coordinates values'
        }
    }
})

export default Location