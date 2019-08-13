/**
 * EMPTY FILE FOR DEFINING ALL SCHEMAS
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
 gender: {
        type: String,
        enum: toEnumArray(Gender),
        default: Gender.UNSPECIFIED
    },
 currentFeeling: {
        type: Number,
        enum: toEnumArray(Category)
    },
 discoveryInfo: {
        currentLocation: {
            type: Location,
            default: null
        }
    },
 userPrefInfo: {
        showInDiscovery: {
            type: Boolean,
            default: true
        }
    }
 distance: {
    type: Number
    note: "only available in discovery mode in km unit"
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
 categoryId: {
        type: Number,
        required: true,
        validate: {
            validator: categoryValidator,
            msg: 'we dont have categoryId {VALUE}.'
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
            isAsync: true,
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
