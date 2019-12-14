import {PostModel, PostType} from "../src/model/Post";
import {Category} from "../src/model/Categories";
import {UserRef} from "../src/model/User";


export default class PostFactory {
    static build(creator: UserRef,
                 title: string = 'default title',
                 type: PostType = PostType.TEXT,
                 category: Category = Category.Loneliness,
                 text: string = 'default text'): PostModel {
        return {
            type,
            category,
            content: {
                detail1: "Detail 1",
                imgUrl1: "img"
            },
            creator,
            title
        } as PostModel
    }
}
