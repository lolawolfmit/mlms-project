import type {HydratedDocument, Types} from 'mongoose';
import type {User} from './model';
import UserModel from './model';

/**
 * This file contains a class with functionality to interact with users stored
 * in MongoDB, including adding, finding, updating, and deleting. Feel free to add
 * additional operations in this file.
 *
 * Note: HydratedDocument<User> is the output of the UserModel() constructor,
 * and contains all the information in User. https://mongoosejs.com/docs/typescript.html
 */
class UserCollection {
  /**
   * Add a new user
   *
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @return {Promise<HydratedDocument<User>>} - The newly created user
   */
  static async addOne(username: string, password: string): Promise<HydratedDocument<User>> {

    const following = new Set<User>;
    const deletedStatus = false;
    const user = new UserModel({username, password, following, deletedStatus});
    await user.save(); // Saves user to MongoDB
    return user;
  }

  /**
   * Find a user by userId.
   *
   * @param {string} userId - The userId of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUserId(userId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({_id: userId});
  }

  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsername(username: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({username: new RegExp(`^${username.trim()}$`, 'i')});
  }

  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @param {string} password - The password of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsernameAndPassword(username: string, password: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({
      username: new RegExp(`^${username.trim()}$`, 'i'),
      password
    });
  }

  /**
   * Update user's information
   *
   * @param {string} userId - The userId of the user to update
   * @param {Object} userDetails - An object with the user's updated credentials
   * @return {Promise<HydratedDocument<User>>} - The updated user
   */
  static async updateOne(userId: Types.ObjectId | string, userDetails: {password?: string; username?: string}): Promise<HydratedDocument<User>> {
    const user = await UserModel.findOne({_id: userId});
    if (userDetails.password) {
      user.password = userDetails.password;
    }

    if (userDetails.username) {
      user.username = userDetails.username;
    }

    await user.save();
    return user;
  }

  /**
   * Delete a user from the collection.
   *
   * @param {string} userId - The userId of user to delete
   * @return {Promise<Boolean>} - true if the user has been deleted, false otherwise
   */
  static async deleteOne(userId: Types.ObjectId | string): Promise<boolean> {
    const user = await UserModel.findOne({_id: userId});
    user.deletedStatus = true;
    return user.deletedStatus;
  }




  /**
   * 
   * Checks if userId follows followeeId
   * 
   * @param userId - The userId of the user who may be a follower of followeeId
   * @param followeeId  - The id of the user userId may be following
   * @returns - boolean for whether userId follows followeeId
   */
  static async isFollowing(userId: Types.ObjectId | string, followeeId: Types.ObjectId | string): Promise<boolean>{
    const followee = await UserModel.findOne({_id: followeeId});
    const user = await UserModel.findOne({_id: userId});
    return user.following.has(followee);
  }


  /**
   * 
   * Gets the followers of userId
   * 
   * @param userId The userId of the user followers follow
   * @return {Promise<Set<User>>} - the list of users that follow userId
   */
  static async findFollowers(userId: Types.ObjectId | string): Promise<Set<User>>{
    const followers = new Set<User>;
    const allUsers = await UserModel.find({});
    for (const potentialFollower of allUsers){
      const isFollowed = await this.isFollowing(userId, potentialFollower._id);
      if (isFollowed){
        followers.add(potentialFollower);
      }
    }
    return followers; //having maping util
  }


  /**
   * 
   * @param userId - userId of the user whose following list will be retrieved
   * @returns {Promise<Set<User>>} - the list of users userId follows
   */
  static async findFollowing(userId: Types.ObjectId | string): Promise<Set<User>>{
    const user = await UserModel.findOne({_id: userId});
    const followingSet = user.following; //have mapping util
    
    return followingSet;
  }
}

export default UserCollection;
