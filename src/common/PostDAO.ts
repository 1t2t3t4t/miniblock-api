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
        const post = await Post.findById(postId)
        if (!post) {
            throw new PostNotFoundError()
        }

        if (interactor) {
            post.setInteractor(interactor)
        }

        return post
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
