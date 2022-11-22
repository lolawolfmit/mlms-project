import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a User
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for User on the backend
export type User = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  username: string;
  password: string;
  following: Set<User>;
  deletedStatus: boolean;
};

export type PopulatedUser = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  username: string;
  password: string;
  following: Set<User>;
  deletedStatus: boolean;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Users stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const UserSchema = new Schema({
  // The user's username
  username: {
    type: String,
    required: true
  },
  // The user's password
  password: {
    type: String,
    required: true
  },
  // The set of users the user followers
  following: {
    type: Set,
    required: true
  },
  // boolean noting whether user's account is deleting
  deletedStatus: {
    type: Boolean,
    required: true
  }
});

const UserModel = model<User>('User', UserSchema);
export default UserModel;
