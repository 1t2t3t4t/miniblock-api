import Post, {isPostModel, PostContentInfo, PostModel, PostRef, PostType} from "../model/Post";
import {isUserModel, UserRef} from "../model/User";
import {Category} from "../model/Categories";

export class PostNotFoundError extends Error {
    message = 'Post does not exist'
}

export class InvalidAuthError extends Error {
    message = 'User does not have permission to do the action'
}

export default class PostDAO {

    async getPost(postId: string,
                  interactor?: UserRef): Promise<PostModel> {
        const post = await Post.findById(postId).populate('creator')
        if (!post) {
            throw new PostNotFoundError()
        }

        if (interactor) {
            post.setInteractor(interactor)
        }

        return post
    }

    async editPost(interactor: UserRef,
                   postId: string,
                   content?: PostContentInfo,
                   type?: PostType,
                   title?: string,
                   categoryId?: Category): Promise<PostModel> {
        const post = await Post.findById(postId)
        if (!post) throw new PostNotFoundError()
        if (!post.checkAuth(interactor).canEdit) throw new InvalidAuthError()

        if (content) {
            post.content = content
        }

        if (type) {
            post.type = type
        }

        if (title) {
            post.title = title
        }

        if (categoryId) {
            post.categoryId = categoryId
        }

        return post.save()
    }

    async createPost(creator: UserRef,
                     content: PostContentInfo,
                     type: PostType,
                     title: string,
                     categoryId: Category): Promise<PostModel> {
        const post = new Post({
            creator,
            content,
            type,
            title,
            categoryId
        })

        post.setInteractor(creator)

        return post.save()
    }

    async deletePost(postId: string, deleter: UserRef) {
        let validAuth = false
        const post = await Post.findById(postId)
        if (!post) throw new PostNotFoundError()
        validAuth = post.checkAuth(deleter).canDelete

        if (validAuth) {
            return post.remove()
        } else {
            throw new InvalidAuthError()
        }
    }

}
