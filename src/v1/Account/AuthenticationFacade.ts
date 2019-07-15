import User, {UserModel} from "../../model/User"
import {MongoError} from "mongodb";

class AccountFacade {

    async register(email: string, displayName: string, uid: string): Promise<UserModel>  {
        let user = new User({ email, displayName, uid })
        return user.save()
    }
}

export default AccountFacade