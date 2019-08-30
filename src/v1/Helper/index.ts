import {GET, Middleware, RouterController} from "../../framework/annotation-restapi";
import Post, {PostModel, PostRef, PostType} from "../../model/Post";
import Comment, {CommentModel, CommentRef} from "../../model/Comment";
import User, {Gender, UserModel, UserRef} from "../../model/User";
import mongoose from "mongoose";
import express from 'express'
import {Category} from "../../model/Categories";
import AuthenticationFacade from '../../common/AccountFacade';
import CommentDAO from "../../common/CommentDAO";
import AccountFacade from "../../common/AccountFacade";
import stringGenerator from "../../utils/stringGenerator";
import DiscoveryManager from "../../common/DiscoveryManager";
import {randomEnum} from "../../utils/enum";
import {isNullOrUndefined} from "util";
import {CurrentFeeling} from "../../model/CurrentFeeling";
import FriendRequestDAO from "../../common/FriendRequestDAO";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";

@RouterController('/helper')
export default class HelperRouterController {

    commentDAO = new CommentDAO()
    accountFacade = new AccountFacade()
    discoveryManager = new DiscoveryManager()
    friendRequestDAO = new FriendRequestDAO()

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
        let users: UserModel[] = []
        if (isNullOrUndefined(req.query.length)) {
            users.push(await this.addUser())
        } else {
            const length = Number(req.query.length)
            for(let i=0;i<length;i++) {
                users.push(await this.addUser())
            }
        }

        res.send({
            users
        })
    }

    private async addUser(): Promise<UserModel> {
        const mockLocation = Math.random() <= 0.5
        const email = stringGenerator(10) + '@gmail.com'
        const displayName = stringGenerator(10) + ' mockedLocation: ' + mockLocation
        const uid = stringGenerator(10)
        const user = await this.accountFacade.register(email, displayName, uid)
        const age = Math.ceil(Math.random() * 10) + 18

        const gender = randomEnum<Gender>(Gender)
        const currentFeeling = [randomEnum<CurrentFeeling>(CurrentFeeling), randomEnum<CurrentFeeling>(CurrentFeeling)]
        if (currentFeeling[0] == currentFeeling[1]) {
            currentFeeling.pop()
        }

        await this.accountFacade.updateProfile(user, { currentFeeling, gender, age })
        if (mockLocation) {
            await this.accountFacade.updateProfile(user, { showInDiscovery: true })
            // 13.75398, 100.50144 is Bangkok Lat and Long
            const latitude = 13.75398 + Math.random()
            const longitude = 100.50144 + Math.random()
            await this.discoveryManager.updateLocation(user, latitude, longitude)
        }

        return user
    }

    @GET('/beFriend/:id')
    @Middleware(ensureAuthenticate)
    async beFriend(req: EnsureAuthRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const request = await this.friendRequestDAO.createFriendRequest(user, req.params.id)
        const accept = await this.friendRequestDAO.friendRequestAccept(request._id.toString())

        res.send({
            accept
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