import {Aggregate, Document} from "mongoose";

export default abstract class Aggregator {

    protected aggregate: Aggregate<any[]>

    protected constructor(aggregate: Aggregate<any[]>) {
        this.aggregate = aggregate
    }

    finalize() {
        return this.aggregate
    }

}