import mongoose from 'mongoose'
import UserPreferences from "../model/UserPreferences";

export class UserPreferencesNotFoundError extends Error {
    message = 'UserPreferences does not exist'
}

export default class UserPreferencesDAO {

    async createUserPreferences(userId: string | mongoose.Types.ObjectId) {
        const userPref = new UserPreferences({userId})
        return userPref.save()
    }

    async updateUserPreferences(userId: string | mongoose.Types.ObjectId,
                                showInDiscovery: boolean) {
        const userPref = await UserPreferences.findById(userId)
        if (!userPref) throw UserPreferencesNotFoundError

        userPref.showInDiscovery = showInDiscovery

        return userPref.save()
    }
}