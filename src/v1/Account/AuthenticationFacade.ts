import User from "../../model/User"

class AccountFacade {

    //TODO: - Change object tobe User interface when implemented
    async register(email: string, displayName: string, uid: string): Promise<object>  {
        let user = new User({ email, displayName, uid })
        return user.save()
    }
}

export default AccountFacade