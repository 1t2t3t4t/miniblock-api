import mongoose from 'mongoose'
import UserPreferences, {UserPreferencesModel} from "../model/UserPreferences";
import {isNullOrUndefined} from "util";

export namespace UserPreferencesError {
    export class NotFoundError extends Error {
        message = 'UserPreferences does not exist'
    }
}

export default class UserPreferencesDAO {

    async getUserPreferences(userId: string | mongoose.Types.ObjectId): Promise<UserPreferencesModel> {
        const userPref = await UserPreferences.findOne(({ userId }))
        if (!userPref) throw new UserPreferencesError.NotFoundError()
        return userPref
    }

    async createUserPreferences(userId: string | mongoose.Types.ObjectId): Promise<UserPreferencesModel> {
        const userPref = new UserPreferences({userId})
        return userPref.save()
    }

    async updateUserPreferences(userId: string | mongoose.Types.ObjectId,
                                showInDiscovery?: boolean): Promise<UserPreferencesModel> {
        let userPref = await UserPreferences.findOne(({ userId }))
        if (!userPref) {
            userPref = await this.createUserPreferences(userId)
        }

        if (!isNullOrUndefined(showInDiscovery)) {
            userPref.showInDiscovery = showInDiscovery
        }

        return userPref.save()
    }
}