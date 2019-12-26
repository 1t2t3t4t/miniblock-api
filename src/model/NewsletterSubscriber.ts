import { Schema, model, Document } from 'mongoose';
const validator = require('validator')

export interface NewsletterSubscriberModel extends Document {
    email: string;
    isCancelled: boolean;
}

const NewsletterSubscriber = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: validator.isEmail,
            msg: '{VALUE} is not a valid email.'
        }
    },
    isCancelled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})


export default model<NewsletterSubscriberModel>('NewsletterSubscriber', NewsletterSubscriber)