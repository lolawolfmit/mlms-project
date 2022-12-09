import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {PopulatedUser, User} from './model';

// Update this if you add a property to the User type!
type UserResponse = {
  _id: string;
  username: string;

};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */

/**
 * Transform a raw User object from the database into an object
 * with all the information needed by the frontend
 * (in this case, removing the password for security)
 *
 * @param {HydratedDocument<User>} user - A user object
 * @returns {UserResponse} - The user object without the password
 */
const constructUserResponse = (user: HydratedDocument<User>): UserResponse => {
  const userCopy: User = {
    ...user.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  delete userCopy.password;
  delete userCopy.deletedStatus;
  delete userCopy.following;
  return {
    ...userCopy,
    _id: userCopy._id.toString()
  };
};

export {
  constructUserResponse
};
