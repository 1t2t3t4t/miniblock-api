import Post, {PostModel} from "../model/Post";
import {DocumentQuery, Model} from "mongoose";
import {Category} from "../model/Categories";
import User, {UserModel} from "../model/User";

interface PostSearchModel extends PostModel {
    title: any
}

export enum FeedSortType {
    New = 'new',
    Top = 'top'
}

export default class FeedManager {

    Post: Model<PostModel>

    constructor(Post: Model<PostModel>) {
        this.Post = Post
    }

    async getAll(limit?: number,
                 afterId?: string,
                 categoryId?: Category,
                 sortType?: FeedSortType,
                 interactor?: UserModel): Promise<PostModel[]> {
        sortType = sortType || FeedSortType.New

        let posts: PostModel[] = []
        switch (sortType) {
            case FeedSortType.New:
                posts = await this.allNew(limit, afterId, categoryId)
                break
            case FeedSortType.Top:
                posts = await this.allTop(limit, afterId, categoryId)
                break
        }

        if (interactor) {
            posts.forEach(post => {
                post.setInteractor(interactor)
            })
        }
        return posts
    }

    async allNew(limit?: number,
                 afterId?: string,
                 categoryId?: Category): Promise<PostModel[]> {
        const query = {} as PostModel

        if (categoryId) {
            query.categoryId = Number(categoryId)
        }

        const documentQuery = this.queryPaginate(query, afterId, limit)

        documentQuery.sort({ createdAt: 'desc' })

        return documentQuery.populate('creator')
    }

    async allTop(limit?: number,
                 afterId?: string,
                 categoryId?: Category): Promise<PostModel[]> {
        const query = {} as any | PostModel

        if (categoryId) {
            query.categoryId = Number(categoryId)
        }

        if (afterId) {
            query._id = { $ne: afterId }

            const post = await Post.findOne({ _id: afterId })
            if (post) {
                query['likeInfo.count'] = {$lt: post.likeInfo.count}
            }
             else {
                throw Error('Cannot find post with afterId:' + afterId)
            }
        }

        const documentQuery = Post.find(query)

        if (limit) {
            documentQuery.limit(Number(limit))
        }

        documentQuery.sort({ 'likeInfo.count': 'desc' })

        const posts = await documentQuery
            .populate('creator')

        return posts
    }

    async search(keyword: string,
                 limit?: number,
                 afterId?: string,
                 interactor?: UserModel): Promise<PostModel[]> {
        const query = {} as PostSearchModel

        query.title = new RegExp(`.*${keyword}.*`,'i')

        const documentQuery = this.queryPaginate(query, afterId, limit)
        const posts = await documentQuery
            .sort({ createdAt: 'desc' })
            .populate('creator')

        if (interactor) {
            posts.forEach(post => {
                post.setInteractor(interactor)
            })
        }
        return posts
    }

    protected queryPaginate(query: any | PostModel,
                            afterId?: string,
                            limit?: number): DocumentQuery<PostModel[], PostModel> {
        if (afterId) {
            query._id = { $lt: afterId }
        }

        const documentQuery = Post.find(query)

        if (limit) {
            documentQuery.limit(Number(limit))
        }

        return documentQuery
    }
}
