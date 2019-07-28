import Post, {PostModel} from "../model/Post";
import {DocumentQuery, Model} from "mongoose";
import {Category} from "../model/Categories";
import {UserModel} from "../model/User";

interface PostSearchModel extends PostModel {
    title: any
}

export default class FeedManager {

    post: Model<PostModel>

    constructor(post: Model<PostModel>) {
        this.post = post
    }

    async getAll(limit?: number,
                  afterId?: string,
                  categoryId?: Category,
                  interactor?: UserModel): Promise<PostModel[]> {
        const query = {} as PostModel

        if (categoryId) {
            query.categoryId = Number(categoryId)
        }

        const documentQuery = this.queryPaginate(query, afterId, limit)

        return documentQuery.populate('creator').exec()
    }

    async search(keyword: string,
                 limit?: number,
                 afterId?: string,
                 interactor?: UserModel): Promise<PostModel[]> {
        const query = {} as PostSearchModel

        query.title = new RegExp(`.*${keyword}.*`,'i')

        const documentQuery = this.queryPaginate(query, afterId, limit)

        return documentQuery.populate('creator').exec()
    }

    protected queryPaginate(query: PostModel,
                            afterId?: string,
                            limit?: number): DocumentQuery<PostModel[], PostModel> {
        if (afterId) {
            query._id = { $lt: afterId }
        }

        const documentQuery = Post.find(query)

        if (limit) {
            documentQuery.limit(Number(limit))
        }
        documentQuery
            .sort({ createdAt: 'desc' })


        return documentQuery
    }
}
