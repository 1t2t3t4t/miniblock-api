const User = require('@model/User')

class AccountFacade {

    //TODO: - Change object tobe User interface when implemented
    async register(email: string, username: string, uid: string): Promise<object>  {
        let user = new User({ email, username, uid })
        return user.save()
    }
}

export default AccountFacade