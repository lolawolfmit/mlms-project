import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import SegmentCollection from '../segment/collection';
import UserCollection from './collection';
import * as userValidator from '../user/middleware';
import * as util from './util';
import UserModel from './model';

const router = express.Router();

/**
 * Get the signed in user
 * TODO: may need better route and documentation
 * (so students don't accidentally delete this when copying over)
 *
 * @name GET /api/users/session
 *
 * @return - currently logged in user, or null if not logged in
 */
router.get(
  '/session',
  [],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUserId(req.session.userId);
    res.status(200).json({
      message: 'Your session info was found successfully.',
      user: user ? util.constructUserResponse(user) : null
    });
  }
);

/**
 * Sign in user.
 *
 * @name POST /api/users/session
 *
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @return {UserResponse} - An object with user's details
 * @throws {403} - If user is already signed in
 * @throws {400} - If username or password is  not in the correct format,
 *                 or missing in the req
 * @throws {401} - If the user login credentials are invalid
 *
 */
router.post(
  '/session',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidUsername,
    userValidator.isValidPassword,
    userValidator.isAccountExists
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsernameAndPassword(
      req.body.username, req.body.password
    );
    req.session.userId = user._id.toString();
    res.status(201).json({
      message: 'You have logged in successfully',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Sign out a user
 *
 * @name DELETE /api/users/session
 *
 * @return - None
 * @throws {403} - If user is not logged in
 *
 */
router.delete(
  '/session',
  [
    userValidator.isUserLoggedIn
  ],
  (req: Request, res: Response) => {
    req.session.userId = undefined;
    res.status(200).json({
      message: 'You have been logged out successfully.'
    });
  }
);

/**
 * Create a user account.
 *
 * @name POST /api/users
 *
 * @param {string} username - username of user
 * @param {string} password - user's password
 * @return {UserResponse} - The created user
 * @throws {403} - If there is a user already logged in
 * @throws {409} - If username is already taken
 * @throws {400} - If password or username is not in correct format
 *
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidUsername,
    userValidator.isUsernameNotAlreadyInUse,
    userValidator.isValidPassword
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.addOne(req.body.username, req.body.password);
    req.session.userId = user._id.toString();
    res.status(201).json({
      message: `Your account was created successfully. You have been logged in as ${user.username}`,
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Update a user's profile.
 *
 * @name PATCH /api/users
 *
 * @param {string} username - The user's new username
 * @param {string} password - The user's new password
 * @return {UserResponse} - The updated user
 * @throws {403} - If user is not logged in
 * @throws {409} - If username already taken
 * @throws {400} - If username or password are not of the correct format
 */
router.patch(
  '/',
  [
    userValidator.isUserLoggedIn,
    userValidator.isValidUsername,
    userValidator.isUsernameNotAlreadyInUse,
    userValidator.isValidPassword
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const user = await UserCollection.updateOne(userId, req.body);
    res.status(200).json({
      message: 'Your profile was updated successfully.',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Delete a user. in this case, set user.deletedStatus = true
 *
 * @name DELETE /api/users
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 */
router.delete(
  '/',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const deletedStat = await UserCollection.deleteOne(userId);
    //console.log("delete");
    //console.log(deletedStat);
    req.session.userId = undefined;
    res.status(200).json({
      message: 'Your account has been deleted successfully.'
    });
  }
);

/**
 * @name PATCH /api/users/follow/:followee
 * 
 * follow another account (followee)
 * 
 * @throws {403} if user is not logged in
 * 
 * @throws {405} if followee doesn't exist/was deleted or is the same as the logged in user
 * 
 * @returns message status on whether followee is now followed by user
 */
router.patch(
  '/follow/:followee?',
  [
    userValidator.isUserLoggedIn,
    userValidator.isValidFollowee
  ],
  async (req: Request, res: Response) => {
    const followee = await UserCollection.findOneByUsername(req.params.followee as string);
    const isFollowed = await UserCollection.isFollowing(req.session.userId as string, followee._id);
    let messageStatus = '';
    if (isFollowed){
      await UserCollection.unfollow(req.session.userId as string, followee._id);
      messageStatus = 'unfollowed';
    }
    else{
      await UserCollection.follow(req.session.userId as string, followee._id);
      messageStatus = 'followed';
    }

    res.status(200).json({
      message: messageStatus
    });
  }
);




/**
 *
 * @name GET /api/users/following/:id
 *
 * @return - list of users that are followed by the user specfied by params
 */
router.get(
  '/following/:user?',
  [
    userValidator.isUserExists
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.params.user);
    const following = await UserCollection.findFollowing(user._id);
    const response = following.map(util.constructUserResponse);
    res.status(200).json(response);
  }
);

 

/**
 *
 * @name GET /api/users/followers/:id
 *
 * @return - list of users that follow the user in params 
 */
router.get(
  '/followers/:user?',
  [
    userValidator.isUserExists
  ],
  async (req: Request, res: Response) => {
    //console.log("made it right before findingFollowers");
    const user = await UserCollection.findOneByUsername(req.params.user);
    // console.log("Found one by username");
    // console.log(user);
    const followers = await UserCollection.findFollowers(user._id);
    const response = followers.map(util.constructUserResponse);
    //console.log("followers in /followers get request");
    //console.log(response);
    res.status(200).json(response);
  }
);


/**
 *
 * @name GET /api/users/publicity/:user
 *
 * @return - users' publicity
 * 
 * @throws {405} - user doesn’t exist/was deleted
 */
router.get(
  '/publicity/:user?',
  [
    userValidator.isUserExists
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.params.user);
    const publicity = await UserCollection.getPublicity(user._id);
    res.status(200).json(publicity.toString());
  }
);


/**
 *
 * @name GET /api/users/existence/:user
 *
 * @return - users' publicity
 * 
 * @throws {405} - user doesn’t exist/was deleted
 */
 router.get(
  '/existence/:user?',
  [
    userValidator.isUserExistsCaseSensitive
  ],
  async (req: Request, res: Response) => {
    res.status(200).json({message: "User Exists"});
  }
);

/**
 *
 * @name PATCH /api/users/publicity/increment/:user
 *
 * increment a user's publicity
 * 
 * @return - new publicity
 * @throws {403} - If user is not logged in
 * @throws {405} - user doesn’t exist/was deleted
 */
router.patch(
  '/publicity/increment/:user?',
  [
    userValidator.isUserExists,
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.params.user);
    const publicity = await UserCollection.incrementPublicity(user._id);
    res.status(200).json(publicity.toString());
  }
);

/**
 *
 * @name PATCH /api/users/publicity/decrement/:user
 *
 * decrement a user's publicity
 * 
 * @return - new publicity
 * 
 * @throws {403} - If user is not logged in
 * @throws {405} - user doesn’t exist/was deleted
 */
router.patch(
  '/publicity/decrement/:user?',
  [
    userValidator.isUserExists,
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.params.user);
    const publicity = await UserCollection.decrementPublicity(user._id);
    res.status(200).json(publicity.toString());
  }
);



export {router as userRouter};
