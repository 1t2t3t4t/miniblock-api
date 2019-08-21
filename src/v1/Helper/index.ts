import {GET, RouterController} from "../../framework/annotation-restapi";
import Post, {PostModel, PostRef, PostType} from "../../model/Post";
import Comment, {CommentModel, CommentRef} from "../../model/Comment";
import User, {UserRef} from "../../model/User";
import mongoose from "mongoose";
import express from 'express'
import {Category} from "../../model/Categories";
import AuthenticationFacade from "../../common/AccountFacade";
import CommentDAO from "../../common/CommentDAO";
import AccountFacade from "../../common/AccountFacade";
import stringGenerator from "../../utils/stringGenerator";

@RouterController('/helper')
export default class HelperRouterController {

    commentDAO = new CommentDAO()
    accountFacade = new AccountFacade()

    @GET('/clean')
    async clean(req: express.Request, res: express.Response, next: express.NextFunction) {
        const facade = new AuthenticationFacade()

        mongoose.connection.db.dropDatabase().then(() => {
            return facade.register("email@test.com", "testman", "1")
        }).then(async () => {
            const collections = await mongoose.connection.db.collections()
            res.status(200).send("done")
        }).catch(() => {
            res.status(500).send("error")
        })
    }

    @GET('/stubUser')
    async stubUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        const email = stringGenerator(10) + '@gmail.com'
        const displayName = stringGenerator(10)
        const uid = stringGenerator(10)
        const user = await this.accountFacade.register(email, displayName, uid)
        res.send({
            user
        })
    }

    @GET('/stubPost')
    async stubPost(req: express.Request, res: express.Response, next: express.NextFunction) {
        let date = Date.now()

        await Post.deleteMany({})
        await Comment.deleteMany({})

        console.log('Clear all...')

        const creator = await User.findByUID('1')

        for(let i=0;i<20;i++) {
            console.log('at', i)

            const likeCount = Math.ceil(Math.random() * 75)
            let likers: mongoose.Types.ObjectId[] = []
            for(let i=0;i<likeCount;i++) {
                likers.push(mongoose.Types.ObjectId())
            }

            console.log('Stub likes', likeCount)

            const cat = [Category.Loneliness, Category.Depression, Category.Relationships, Category.SocialProblems]

            const categoryId = Math.ceil(Math.random() * cat.length)

            const post = new Post({
                creator,
                content: {
                    text: "test " + i
                },
                type: PostType.TEXT,
                title: "title " + i + "cat " + categoryId,
                categoryId,
                likeInfo: {
                    like: likers
                }
            })

            const p = await post.save()

            console.log('Stub post')

            const comments =  this.addComment(p, creator)

            let sc: CommentModel[] = []

            for (let c of comments) {
                if (Math.random() <= 0.5) {
                    sc.push(...this.addSubComment(p, creator, c))
                } else {
                    console.log('Skip sub comments', c._id.toString())
                }
            }

            console.log('Create comments')
            await Comment.create(comments)
            console.log('Create subcomments')
            await Comment.create(sc)
            console.log('update post')
            await p.save()
        }

        console.log('Completed with time', Date.now() - date, 'ms.')
        res.status(200).send('DONE')
    }

    addComment(post: PostModel, creator: UserRef) {
        const commentCount = Math.ceil(Math.random() * 20)
        let comments: CommentModel[]  = []
        console.log('Stubbing comments')
        for(let i=0;i<commentCount;i++) {
            const comment = new Comment({
                post: post._id,
                creator,
                content: {
                    text: 'Content number ' + i
                }
            })
            comments.push(comment)
            console.log('Stub comment', i, '/', commentCount)
        }
        post.commentInfo.comments.push(...comments)
        return comments
    }

    addSubComment(post: PostModel, creator: UserRef, parent: CommentModel) {
        const scc = Math.ceil(Math.random() * 20)
        let sc: CommentModel[]  = []
        console.log('Stubbing sub comments', parent.toString())
        for(let i=0;i<scc;i++) {
            const comment = new Comment({
                post: post._id,
                creator,
                parent,
                content: {
                    text: 'Content number ' + i
                }
            })
            sc.push(comment)
            console.log('Stub sub comment', i, '/', scc)
        }

        post.commentInfo.comments.push(...sc)
        parent.subCommentInfo.comments.push(...sc)
        return sc
    }

}