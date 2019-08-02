import Comment, {CommentModel} from "../model/Comment";
import {PostRef} from "../model/Post";
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

    createComment(postId: PostRef,
                  creator: UserRef,
                  text: string) {
        const comment = new Comment({
            post: postId,
            creator,
            content: {
                text
            }
        })

        return comment.save()
    }

}