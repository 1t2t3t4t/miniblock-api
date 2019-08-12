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
              gender: Gender,
              currentFeeling: Category,
              maxDistance: number): Promise<UserModel[]> {
        const coordinates = user.discoveryInfo.currentLocation.coordinates
        const locationQuery: any = {
            $near: {
                $geometry: {
                    type: LocationType.POINT,
                    coordinates: coordinates
                }
            }
        }

        if (!isNullOrUndefined(maxDistance)) {
            locationQuery.$near.$maxDistance = maxDistance
        }

        const query = User.find({
            _id: {
                $ne: user._id
            },
            'discoveryInfo.currentLocation': locationQuery
        })

        return await query
    }
}