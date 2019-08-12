import User, {Gender, UserModel} from "../model/User";
import {Category} from "../model/Categories";
import {isNullOrUndefined} from "util";
import {Coordinates, LocationType} from "../model/Location";

export default class DiscoveryManager {

    updateLocation(user: UserModel,
                   coordinates: Coordinates): Promise<UserModel> {
        user.discoveryInfo.currentLocation = {
            coordinates
        }

        return user.save()
    }

    async discovery(user: UserModel,
                    currentFeeling: Category,
                    maxDistance: number,
                    page: number,
                    limit: number,
                    gender?: Gender,): Promise<UserModel[]> {
        const coordinates = user.discoveryInfo.currentLocation.coordinates
        const locationQuery: any = {
            near: {
                type: LocationType.POINT,
                coordinates: coordinates
            },
            distanceField: "distance",
            spherical : true,
            distanceMultiplier : 0.001
        }

        if (!isNullOrUndefined(maxDistance)) {
            locationQuery.maxDistance = maxDistance
        }

        let query: any = {
            _id: {
                $ne: user._id
            },
            currentFeeling: currentFeeling
        }

        if (!isNullOrUndefined(gender)) {
            query.gender = gender
        }
        const skip = page * limit

        return await User
            .aggregate()
            .near(locationQuery)
            .match(query)
            .skip(skip)
            .limit(limit)
    }
}