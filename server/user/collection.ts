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

    const following = new Array<User>;
    const deletedStatus = false;
    const publicity = 0;
    const user = new UserModel({username, password, publicity, following, deletedStatus});
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
    user.following = new Array<User>;
    const followers = await this.findFollowers(userId);

    for (const follower of followers){
      await this.unfollow(follower._id, user._id);
    }

    user.deletedStatus = true;
    await user.save();
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
    ;
    for (const target of user.following){
      
      const potentialFollowee = await UserModel.findOne({_id: target._id});
    
      if (potentialFollowee._id.toString() === followee._id.toString()){
        //console.log("user is following...............")
        return true;
      }
    }

    //console.log("user is not following followee!!!!!!!!!!!!!!!")
    return false;
  }


  /**
   * 
   * Gets the followers of userId
   * 
   * @param userId The userId of the user followers follow
   * @return {Promise<Array<User>>} - the list of users that follow userId
   */
  static async findFollowers(userId: Types.ObjectId | string): Promise<Array<User>>{
    const followers = new Array<User>;
    const allUsers = await UserModel.find({});
    for (const potentialFollower of allUsers){
      const isFollowed = await this.isFollowing(potentialFollower._id, userId);
      if (isFollowed && !potentialFollower.deletedStatus){
        followers.push(potentialFollower);
      }
    }
    //console.log(followers);
    return followers; //having maping util
  }


  /**
   * 
   * @param userId - userId of the user whose following list will be retrieved
   * @returns {Promise<Array<User>>} - the list of users userId follows
   */
  static async findFollowing(userId: Types.ObjectId | string): Promise<Array<User>>{
    const user = await UserModel.findOne({_id: userId});
    const followingArray = new Array<User>;

    for (const followedUser of user.following){
      const author = await this.findOneByUserId(followedUser._id);
      followingArray.push(author);
    }
    
    return followingArray;
  }


  /**
   * 
   * @param followerId - id of user who will follow followeeId
   * @param followeeId - id of user who will be followed
   */
  static async follow(followerId: Types.ObjectId | string, followeeId: Types.ObjectId | string): Promise<void>{
    const follower = await UserModel.findOne({_id: followerId});
    const followee = await UserModel.findOne({_id: followeeId});

    follower.following.push(followee);
    await follower.save();
  }


  /**
   * 
   * @param followerId - id of user who is user who is following followeeId
   * @param followeeId - id of user who is being followed
   */
  static async unfollow(followerId: Types.ObjectId | string, followeeId: Types.ObjectId | string): Promise<void>{
    const follower = await UserModel.findOne({_id: followerId});
    const followee = await UserModel.findOne({_id: followeeId});
    const followingList = new Array<User>;


    for (const target of follower.following){
      const potentialFollowee = await UserModel.findOne({_id: target._id});
      
      if (potentialFollowee._id.toString() !== followee._id.toString()){
        //console.log("non problematic user.......!!!!.....")
        followingList.push(potentialFollowee);
      }
    }

    follower.following = followingList;
    await follower.save();

  }

  static async incrementPublicity(userId: Types.ObjectId | string): Promise<number>{
    const user = await UserModel.findOne({_id: userId});
    user.publicity += 1;
    const publicity = user.publicity;

    await user.save();

    return publicity;
  }

  static async decrementPublicity(userId: Types.ObjectId | string): Promise<number>{
    const user = await UserModel.findOne({_id: userId});
    user.publicity -= 1;
    const publicity = user.publicity;

    await user.save();
    
    return publicity;
  }

  static async getPublicity(userId: Types.ObjectId | string): Promise<number>{
    const user = await UserModel.findOne({_id: userId});
    const publicity = user.publicity;
    return publicity;
  }

}

export default UserCollection;
