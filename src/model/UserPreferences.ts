import mongoose from 'mongoose'

const Schema = mongoose.Schema

export interface UserPreferencesModel extends mongoose.Document {
    userId: mongoose.Types.ObjectId | string
    showInDiscovery: boolean
}

const UserPreferences = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    showInDiscovery: {
        type: Boolean,
        default: true
    }
})

export default mongoose.model<UserPreferencesModel>('UserPreferences', UserPreferences)