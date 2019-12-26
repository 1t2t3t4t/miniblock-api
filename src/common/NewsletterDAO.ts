import NewsletterSubscriber, { NewsletterSubscriberModel } from '../model/NewsletterSubscriber';

export default class NewsletterDAO {
    
    async subscribe(email: string): Promise<NewsletterSubscriberModel> {
        const doc = { email } as NewsletterSubscriberModel
        const subscriber = new NewsletterSubscriber(doc)
        return subscriber.save()
    }
}
