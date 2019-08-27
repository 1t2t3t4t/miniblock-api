import User, {Gender, UserModel} from "../model/User"
import {isNullOrUndefined} from "util";
import {CurrentFeeling} from "../model/CurrentFeeling";

export namespace FriendRequestError {
    export class RequestNotFound extends Error {
        message = 'There is no request for this user'
    }

    export class AlreadyAdded extends Error {
        message = 'User already added'
    }
}

interface UpdateProfileParams {
    displayName?: string,
    image?: string,
    age?: number,
    showInDiscovery?: boolean,
    gender?: Gender,
    currentFeeling?: CurrentFeeling[]
}

class AccountFacade {

    async register(email: string, displayName: string, uid: string): Promise<UserModel>  {
        let user = new User({ email, displayName, uid })
        return user.save()
    }
    
    async updateProfile(user: UserModel, params: UpdateProfileParams): Promise<UserModel> {
        const { displayName, image, age, showInDiscovery, gender, currentFeeling } = params

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