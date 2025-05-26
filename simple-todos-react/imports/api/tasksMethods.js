import {Meteor} from "meteor/meteor";
import { TasksCollection } from "./TasksCollection";


Meteor.methods({
    "tasks.insert"(doc){
        return TasksCollection.insertAsync(doc);
    },

    "tasks.delete"({ _id }) {
    return TasksCollection.removeAsync(_id); },

    "tasks.toggleChecked" ({_id, isChecked}){
        return TasksCollection.updateAsync(_id, {
            $set: {isChecked: !isChecked},
        });
    },
});