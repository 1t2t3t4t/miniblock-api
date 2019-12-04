import User, {Gender, UserModel} from "../model/User"
import {isNullOrUndefined} from "util";
import {CurrentFeeling} from "../model/CurrentFeeling";

interface UpdateProfileParams {
    displayName?: string,
    image?: string,
    age?: number,
    description?: string,
    gender?: Gender,
    currentFeeling?: CurrentFeeling[]
}

class AccountFacade {

    async register(email: string, displayName: string, uid: string): Promise<UserModel>  {
        let user = new User({ email, displayName, uid })
        return user.save()
    }
    
    async updateProfile(user: UserModel, params: UpdateProfileParams): Promise<UserModel> {
        const { displayName, image, age, gender, currentFeeling, description } = params

        if (displayName) {
            user.displayName = displayName
        }

        if (age) {
            user.age = age
        }

        if (description) {
            user.description = description
        }

        if (image) {
            user.displayImageInfo = { image }
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