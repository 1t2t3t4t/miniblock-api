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
                 page?: number,
                 category?: string,
                 sortType?: FeedSortType,
                 interactor?: UserModel): Promise<PostModel[]> {
        sortType = sortType || FeedSortType.New

        let posts: PostModel[] = []
        switch (sortType) {
            case FeedSortType.New:
                posts = await this.allNew(limit, page, category)
                break
            case FeedSortType.Top:
                posts = await this.allTop(limit, page, category)
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
                 page?: number,
                 category?: string): Promise<PostModel[]> {
        const query = {} as PostModel

        if (category) {
            query.category = category
        }

        const documentQuery = this.queryPaginate(query, page, limit)

        documentQuery.sort({ createdAt: 'desc' })

        return documentQuery.populate('creator')
    }

    async allTop(limit?: number,
                 page?: number,
                 category?: string): Promise<PostModel[]> {
        const query = {} as any | PostModel

        if (category) {
            query.category = category
        }

        const skip = ((page || 1) - 1) * (limit || 20)
        
        const documentQuery = Post.find(query)
        .sort({ "likeInfo.count": "desc" })
        .skip(skip)

        if (limit) {
            documentQuery.limit(Number(limit))
        }

        documentQuery.sort({ 'createdAt': 'desc' })

        const posts = await documentQuery
            .populate('creator')

        return posts
    }

    async search(keyword: string,
                 limit?: number,
                 page?: number,
                 interactor?: UserModel): Promise<PostModel[]> {
        const query = {} as PostSearchModel

        query.title = new RegExp(`.*${keyword}.*`,'i')

        const documentQuery = this.queryPaginate(query, page, limit)
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
                            page?: number,
                            limit?: number): DocumentQuery<PostModel[], PostModel> {
        const skip = ((page || 1) - 1) * (limit || 20)
        const documentQuery = Post.find(query).skip(skip)

        documentQuery.limit(Number(limit))
        return documentQuery
    }
}
