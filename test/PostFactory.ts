import {PostModel, PostType} from "../src/model/Post";
import {Category} from "../src/model/Categories";
import {UserRef} from "../src/model/User";


export default class PostFactory {
    static build(creator: UserRef,
                 title: string = 'default title',
                 type: PostType = PostType.TEXT,
                 categoryId: Category = Category.Loneliness,
                 text: string = 'default text'): PostModel {
        return {
            type,
            categoryId,
            content: {
                text
            },
            creator,
            title
        } as PostModel
    }
}
