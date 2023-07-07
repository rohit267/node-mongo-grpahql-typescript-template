import {
    BulkWriteOptions,
    Collection,
    DeleteOptions,
    Document,
    Filter,
    FindOneAndDeleteOptions,
    FindOneAndUpdateOptions,
    FindOptions,
    InsertManyResult,
    OptionalUnlessRequiredId,
    UpdateFilter,
    UpdateOptions,
} from "mongodb";
import { db } from "./MongoDB";

export class BaseCollection<T extends Document> {
    private client = db;
    private collection: string;

    constructor(collectionName: string) {
        this.collection = collectionName;
    }

    async insertOne(document: OptionalUnlessRequiredId<T>): Promise<string> {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const result = await collection.insertOne(document);
        return result.insertedId.toString();
    }

    async insertMany(
        documents: OptionalUnlessRequiredId<T>[],
        options: BulkWriteOptions = {}
    ) {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const result: InsertManyResult<T> = await collection.insertMany(
            documents,
            options
        );
        return result.insertedCount;
    }

    async findOne(query: Filter<T>, options: FindOptions<T> = {}) {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const results = await collection.findOne(query, options);
        return results;
    }

    async find(query: Filter<T>, options: FindOptions<T> = {}) {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const results = await collection
            .find(query, {
                ...options,
                sort: {
                    "meta.created_at": -1,
                    _id: -1
                },
            })
            .toArray();
        return results;
    }

    async updateOne(
        query: Filter<T>,
        update: UpdateFilter<T>,
        options: FindOneAndUpdateOptions = {}
    ) {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const result = await collection.findOneAndUpdate(
            query,
            update,
            options
        );

        return result;
    }

    async updateMany(
        query: Filter<T>,
        update: UpdateFilter<T>,
        options: UpdateOptions = {}
    ) {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const result = await collection.updateMany(query, update, options);
        return result.modifiedCount;
    }

    async deleteOne(query: Filter<T>, options: FindOneAndDeleteOptions = {}) {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const result = await collection.findOneAndDelete(query, options);
        return result.ok;
    }

    async deleteMany(
        query: Filter<T>,
        options: DeleteOptions = {}
    ): Promise<number> {
        const collection: Collection<T> = this.client.collection(
            this.collection
        );
        const result = await collection.deleteMany(query, options);
        return result.deletedCount;
    }
}
