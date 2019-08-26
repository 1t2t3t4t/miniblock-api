import User, {Gender, UserModel} from "../model/User";
import {Category} from "../model/Categories";
import {isNullOrUndefined} from "util";
import {Coordinates, LocationType} from "../model/Location";
import {CurrentFeeling} from "../model/CurrentFeeling";

export namespace DiscoveryError {
    export class NullLocation extends Error {
        message = 'User has no location'
    }
}

export default class DiscoveryManager {

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
                    currentFeeling: CurrentFeeling,
                    maxDistance: number,
                    page: number,
                    limit: number,
                    gender?: Gender,): Promise<UserModel[]> {
        const currentLocation = user.discoveryInfo.currentLocation
        if (isNullOrUndefined(currentLocation)) throw new DiscoveryError.NullLocation()

        const coordinates = currentLocation.coordinates
        const locationQuery: any = {
            near: {
                type: LocationType.POINT,
                coordinates: coordinates
            },
            distanceField: "distance",
            spherical : true,
            distanceMultiplier : 1 / 1000
        }

        if (!isNullOrUndefined(maxDistance)) {
            locationQuery.maxDistance = maxDistance * 1000
        }

        let query: any = {
            _id: {
                $ne: user._id
            },
            currentFeeling: currentFeeling,
            'userPrefInfo.showInDiscovery': true
        }

        console.log(gender)
        if (!isNullOrUndefined(gender)) {
            console.log(gender)
            query.gender = gender
        }

        locationQuery.query = query

        const skip = page * limit

        return await User
            .aggregate()
            .near(locationQuery)
            .skip(skip)
            .limit(limit)
    }
}