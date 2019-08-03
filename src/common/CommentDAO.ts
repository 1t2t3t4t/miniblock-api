import Comment, {CommentModel, CommentRef} from "../model/Comment";
import Post, {PostRef} from "../model/Post";
import {UserRef} from "../model/User";

export default class CommentDAO {

    getAll(postId: PostRef,
           parent?: CommentRef) {
        let query = {} as any | CommentModel
        query.post = postId
        query.parent = parent

        const documentQuery = Comment.find(query)
            .sort({ createdAt: -1 })
            .populate('creator')

        return documentQuery
    }

    async createComment(postId: PostRef,
                        creator: UserRef,
                        text: string) {
        const comment = new Comment({
            post: postId,
            creator,
            content: {
                text
            }
        })

        const savedComment = await comment.save()
        const post = await Post.findById(postId)
        post!.commentInfo.comments.push(savedComment)
        await post!.save()
        return savedComment
    }

    async createSubComment(postId: PostRef,
                           parent: CommentRef,
                           creator: UserRef,
                           text: string) {
        const comment = new Comment({
            post: postId,
            parent,
            creator,
            content: {
                text
            }
        })

        const savedComment = await comment.save()

        const parentComment = await Comment.findById(parent)
        parentComment!.subCommentInfo.comments.push(savedComment)
        await parentComment!.save()

        const post = await Post.findById(postId)
        post!.commentInfo.comments.push(savedComment)
        await post!.save()

        return savedComment
    }

}