import {Coordinates, LocationInfo, UserModel} from "../model/User";

export default class DiscoveryManager {

    updateLocation(user: UserModel,
                   coordinates: Coordinates): Promise<UserModel> {
        user.discoveryInfo.currentLocation = {
            coordinates
        }

        return user.save()
    }



}