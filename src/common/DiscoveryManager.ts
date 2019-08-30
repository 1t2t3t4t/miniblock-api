import User, {Gender, UserModel} from "../model/User";
import {Category} from "../model/Categories";
import {isNullOrUndefined} from "util";
import {Coordinates, LocationType} from "../model/Location";
import {CurrentFeeling} from "../model/CurrentFeeling";
import DiscoveryAggregator from "./Aggregator/Discovery/DiscoveryAggregator";
import {Aggregate} from "mongoose";

export namespace DiscoveryError {
    export class NullLocation extends Error {
        message = 'User has no location'
    }
}

interface DiscoveryFilter {
    currentFeeling: CurrentFeeling,
    maxDistance?: number,
    page: number,
    limit: number,
    gender?: Gender,
    minAge?: number,
    maxAge?: number
}

export default class DiscoveryManager {

    aggregator!: DiscoveryAggregator

    updateLocation(user: UserModel,
                   latitude: number,
                   longitude: number): Promise<UserModel> {
        const coordinates: Coordinates = [longitude, latitude]
        user.discoveryInfo.currentLocation = {
            coordinates
        }

        return user.save()
    }

    async discovery(user: UserModel,
                    filter: DiscoveryFilter): Promise<UserModel[]> {
        const { page, limit } = filter
        const currentLocation = user.discoveryInfo.currentLocation
        if (isNullOrUndefined(currentLocation)) throw new DiscoveryError.NullLocation()
        const coordinates = currentLocation.coordinates

        this.aggregator = new DiscoveryAggregator(User.aggregate(), user)
            .locationNear(coordinates, filter)
            .filterOutAddedUser()

        const skip = page * limit

        return await this.aggregator
            .finalize()
            .skip(skip)
            .limit(limit)
    }
}