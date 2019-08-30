import Aggregator from "../Aggregator";
import User, {Gender, UserModel} from "../../../model/User";
import {Coordinates, LocationType} from "../../../model/Location";
import {isNullOrUndefined} from "util";
import {CurrentFeeling} from "../../../model/CurrentFeeling";
import {Aggregate} from "mongoose";

interface Filter {
    currentFeeling: CurrentFeeling,
    maxDistance?: number,
    gender?: Gender,
    minAge?: number,
    maxAge?: number
}

export default class DiscoveryAggregator extends Aggregator {

    private user: UserModel

    constructor(aggregate: Aggregate<any[]>, user: UserModel) {
        super(aggregate)
        this.user = user
    }

    locationNear(coordinates: Coordinates, filter?: Filter) {
        const locationQuery: any = {
            near: {
                type: LocationType.POINT,
                coordinates: coordinates
            },
            distanceField: "distance",
            spherical : true,
            distanceMultiplier : 1 / 1000
        }

        if (filter) {
            this.filterLocationQuery(locationQuery, filter)
        }

        this.aggregate.near(locationQuery)

        return this
    }

    private filterLocationQuery(locationQuery: any, filter: Filter) {
        const { currentFeeling, gender, maxDistance, minAge, maxAge } = filter

        if (!isNullOrUndefined(maxDistance)) {
            locationQuery.maxDistance = maxDistance * 1000
        }

        let query: any = {
            _id: {
                $ne: this.user._id
            },
            currentFeeling: currentFeeling,
            'userPrefInfo.showInDiscovery': true
        }

        if (!isNullOrUndefined(gender)) {
            query.gender = gender
        }

        if (!isNullOrUndefined(minAge) || !isNullOrUndefined(maxAge)) {
            query.age = {}

            if (!isNullOrUndefined(minAge)) {
                query.age.$gte = minAge
            }

            if (!isNullOrUndefined(maxAge)) {
                query.age.$lte = maxAge
            }
        }

        locationQuery.query = query
    }

    filterOutAddedUser() {
        const friendRequestLookup = {
            from: 'friendrequests',
            let: {
                requested: '$_id'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: ["$user", this.user._id]
                                },
                                {
                                    $eq: ["$requestedUser", "$$requested"]
                                }
                            ]
                        }
                    }
                }
            ],
            as: 'friendRequests'
        }

        const chatRoomLookup = {
            from: 'chatrooms',
            let: {
                requested: '$_id'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $in: [this.user._id, "$users"]
                                },
                                {
                                    $in: ["$$requested", "$users"]
                                }
                            ]
                        }
                    }
                }
            ],
            as: 'chatRooms'
        }

        const filterOutAddedUsers = {
            friendRequests: {
                $size: 0
            },
            chatRooms: {
                $size: 0
            }
        }

        this.aggregate
            .lookup(friendRequestLookup)
            .lookup(chatRoomLookup)
            .match(filterOutAddedUsers)

        return this
    }
}