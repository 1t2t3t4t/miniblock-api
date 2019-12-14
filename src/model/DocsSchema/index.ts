/**
 * EMPTY FILE FOR DEFINING ALL SCHEMAS
 * */

/**
 * @api {GET} auth Post AuthInfo Schema
 * @apiGroup Schema
 * @apiExample auth schema
 *
 AuthInfo {
    canDelete: boolean
    canEdit: boolean
    canSeeProfile: boolean
}
 * */

/**
 * @api {GET} user User Schema
 * @apiGroup Schema
 * @apiExample user schema
 uid: {
        type: String,
        required: true,
        unique: true
    },
 email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            msg: '{VALUE} is not a valid email.'
        }
    },
 displayName: {
        type: String,
        required: true,
        minlength: 1
    },
 displayImageInfo: {
        image: {
            type: String
        }
    },
 age: {
        type: Number,
        default: 0
    },
 gender: {
        type: String,
        enum: toEnumArray(Gender),
        default: Gender.UNSPECIFIED
    },
 currentFeeling: [
 {
            type: Number,
            enum: toEnumArray(CurrentFeeling)
        }
 ],
 anonymousInfo: {
        displayName: {
            type: String
        }
    }
 *
 * */

/**
 * @api {GET} post Post Schema
 * @apiGroup Schema
 * @apiExample post schema
 title: {
        type: String,
        required: true,
    },
 category: {
        type: Number,
        required: true,
        validate: {
            validator: categoryValidator,
            msg: 'we dont have category {VALUE}.'
        },
        index: true
    },
 type: {
        type: String,
        required: true,
        validate: {
            validator: postTypeValidator,
            msg: 'we have no type {VALUE}.'
        }
    },
 content: {
        type: {
            text: {
                type: String
            },
            link: {
                type: String
            },
            imageInfo: {
                image: {
                    required: true,
                    type: String
                },
                width: {
                    type: Number
                },
                height: {
                    type: Number
                }
            }
        },
        required: true,
        validate: {
            validator: contentValidator,
            msg: 'content does not conform to type'
        }
    },
 creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
 likeInfo: {
        like: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        count: {
            type: Number
        },
        isLiked: {
            type: Boolean,
            hasToBeAuthenticated: true
        }
    },
 commentInfo: {
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
        count: {
            type: Number
        }
    },
 authInfo: {
    canDelete: {
            type: Boolean,
            hasToBeAuthenticated: true
    },
    canEdit: {
            type: Boolean,
            hasToBeAuthenticated: true
    }
 }
 *
 * */

/**
 * @api {GET} comment Comment Schema
 * @apiGroup Schema
 * @apiExample comment schema
 post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        validate: {
            validator: validatePost,
            msg: 'PostId {VALUE} does not exist'
        }
    },
 parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
 creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
 content: {
        text: {
            type: String,
            required: true
        }
    },
 subCommentInfo: {
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
        count: {
            type: Number
        }
    }
 *
 * */

/**
 * @api {GET} friendRequest Friend Request Schema
 * @apiGroup Schema
 * @apiExample friend request schema
 user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
},
 requestedUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'User'
},
 status: {
    type: String,
    enum: toEnumArray(FriendRequestStatus),
    default: FriendRequestStatus.Pending
}
 *
 * */

/**
 * @api {GET} chatRoom Chat Room Schema
 * @apiGroup Schema
 * @apiExample chat room schema
 users: [
 {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
 ],
 chatRoomId: {
        type: String,
        required: true,
        index: true
    },
 latestMessageInfo: {
        type: MessageSchema
 }
 *
 * */

/**
 * @api {GET} message Message Schema
 * @apiGroup Schema
 * @apiExample message schema
 chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
 messageInfo: {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: toEnumArray<string>(MessageType)
        },
        content: {
            type: String,
            required: true
        }
    }
 *
 * */
