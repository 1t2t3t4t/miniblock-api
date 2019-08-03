import Comment, {CommentModel} from "../model/Comment";
import Post, {PostRef} from "../model/Post";
import {UserRef} from "../model/User";

export default class CommentDAO {

    getAll(postId: PostRef) {
        let query = {} as any | CommentModel
        query.post = postId

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

}