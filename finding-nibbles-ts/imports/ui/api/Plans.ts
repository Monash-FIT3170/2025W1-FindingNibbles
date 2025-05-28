import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export interface PlanType {
    _id?: string;
    userId: string;
    title: string;
    restaurants: any[];
    startingPoint?: string;
    destination?: string;
    tripStartDate?: Date;
}

// Define the collection first
export const Plans = new Mongo.Collection<PlanType>("plans");

// Publish plans for the current user
if (Meteor.isServer) {
    Meteor.publish("plans", function () {
        if (!this.userId) {
            return this.ready();
        }
        return Plans.find({ userId: this.userId as string });
    });
}

Meteor.methods({
    async "plans.insert"(
        title: string,
        startingPoint?: string,
        destination?: string,
        tripStartDate?: Date
    ) {
        console.log(
            "plans.insert called",
            this.userId,
            title,
            startingPoint,
            destination,
            tripStartDate
        );
        if (!this.userId) throw new Meteor.Error("Not authorized");
        return await Plans.insertAsync({
            userId: this.userId,
            title,
            restaurants: [],
            startingPoint,
            destination,
            tripStartDate,
        });
    },
    async "plans.addRestaurant"(planId: string, restaurant: any) {
        console.log(
            "plans.addRestaurant called",
            this.userId,
            planId,
            restaurant
        );
        if (!this.userId) throw new Meteor.Error("Not authorized");
        return await Plans.updateAsync(
            { _id: planId, userId: this.userId },
            { $addToSet: { restaurants: restaurant } }
        );
    },
    async "plans.remove"(planId: string) {
        if (!this.userId) throw new Meteor.Error("Not authorized");
        const plan = await Plans.findOneAsync({
            _id: planId,
            userId: this.userId,
        });
        if (!plan) throw new Meteor.Error("Plan not found or not authorized");
        return await Plans.removeAsync({ _id: planId, userId: this.userId });
    },
    async "plans.updatePlan"(
        planId: string,
        title: string,
        newRestaurants: any[],
        startingPoint?: string,
        destination?: string,
        tripStartDate?: Date
    ) {
        if (!this.userId) throw new Meteor.Error("Not authorized");
        const plan = await Plans.findOneAsync({
            _id: planId,
            userId: this.userId,
        });
        if (!plan) throw new Meteor.Error("Plan not found or not authorized");
        return await Plans.updateAsync(
            { _id: planId, userId: this.userId },
            {
                $set: {
                    title,
                    restaurants: newRestaurants,
                    startingPoint,
                    destination,
                    tripStartDate,
                },
            }
        );
    },
});
