import User, {Gender, UserModel} from "../model/User"
import {MongoError} from "mongodb";
import {CurrentFeeling} from "../model/CurrentFeeling";
import {isNullOrUndefined} from "util";

class AccountFacade {

    async register(email: string, displayName: string, uid: string): Promise<UserModel>  {
        let user = new User({ email, displayName, uid })
        return user.save()
    }

    async update(user: UserModel,
                 displayName?: string,
                 age?: number,
                 image?: string,
                 showInDiscovery?: boolean,
                 gender?: Gender,
                 currentFeeling?: CurrentFeeling[]): Promise<UserModel> {
        if (displayName) {
            user.displayName = displayName
        }

        if (age) {
            user.age = age
        }

        if (image) {
            user.displayImageInfo = { image }
        }

        if (!isNullOrUndefined(showInDiscovery)) {
            user.userPrefInfo.showInDiscovery = showInDiscovery
        }

        if (gender) {
            user.gender = gender
        }

        if (currentFeeling) {
            user.currentFeeling = currentFeeling
        }

        return user.save()
    }
}

export default AccountFacade