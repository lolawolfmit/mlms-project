import type { HydratedDocument, Types } from 'mongoose';
import type { Segment } from './model';
import SegmentModel from './model';
import UserCollection from '../user/collection';
import type {User} from '../user/model';

class SegmentCollection {
  /**
   * Add a new segment to the collection
   * @param {string} authorId - The author of the segment
   * @param {string} content - The content of the segment
   * @param {string} parent - The parent of the segment
   * @returns {Promise<HydratedDocument<Segment>>} - The newly created segment
   */
  static async addSegment(authorId: Types.ObjectId | string, content: string, storyTitle: string, segmentTitle: string, parent: Types.ObjectId | null): Promise<HydratedDocument<Segment>> {
    const segment = new SegmentModel({
      authorId,
      datePublished: new Date(),
      storyTitle,
      segmentTitle,
      content,
      parent,
      likes: [],
      storyPart: parent == null ? 1 : (await this.getSegmentByID(parent)).storyPart + 1
    });
    await segment.save();
    return segment.populate('authorId');
  }

  /**
   * Get all the segments in the collection
   * @returns {Promise<HydratedDocument<Segment>[]>} - All the segments in the collection
   */
  static async getAllSegments(): Promise<Array<HydratedDocument<Segment>>> {
    return SegmentModel.find({}).sort({ datePublished: -1 }).populate('authorId');
  }

  /**
   * Get a segment by segmentId
   * @param {string} segmentId - The segmentId of the segment to find
   * @returns {Promise<HydratedDocument<Segment>> | Promise<null>} - The Segment
   */
  static async getSegmentByID(segmentId: Types.ObjectId | string): Promise<HydratedDocument<Segment>> {
    return SegmentModel.findOne({ _id: segmentId }).populate('authorId');
  }

  /**
   * Get all segments by a given author
   * @param {string} username - The username of the author
   * @returns {Promise<HydratedDocument<Segment>[]>} - The segments by the author
   */
  static async getSegmentsByAuthor(username: string): Promise<Array<HydratedDocument<Segment>>> {
    const author = await UserCollection.findOneByUsername(username);
    return SegmentModel.find({ authorId: author._id }).sort({ datePublished: -1 }).populate('authorId');
  }

  /** 
   * Get all the children of a segment
   * @param {string} parentId - The segmentId of the parent
   * @returns {Promise<HydratedDocument<Segment>[]>} - The children of the parent
  */
  static async getChildren(parentId: Types.ObjectId | string): Promise<Array<HydratedDocument<Segment>>> {
    return SegmentModel.find({ parent: parentId }).sort({ datePublished: -1 }).populate(['parent', 'authorId']);
  }

  /**
   * Get all the segments in a user's homepage
   * @param {string} userId - The userID of the user whose homepage to get
   * @param {string} filter - The keywords to search for
   * @returns {Promise<HydratedDocument<Segment>[]>} - The most recent 20 segments in the user's homepage
   */
  static async getHomepage(userId: Types.ObjectId | string, filter: string): Promise<Array<HydratedDocument<Segment>>> {
    const user = await UserCollection.findOneByUserId(userId);
    const following = user.following.push(user);
    const segments = await SegmentModel.find({ authorId: { $in: following } }).sort({ datePublished: -1 }).populate('authorId');
    if (!filter) {
      return segments.slice(0, 20);
    }
    else {
      const keywords = filter.split(",");
      const regexPattern = "^" + keywords.map(s => `(?=.*?\\b${s}\\b)`).join("") + "";
      const filtered_segments = segments.filter(segment => (segment.content + " " + segment.storyTitle + " " + segment.segmentTitle).match(regexPattern) !== null); 
      return filtered_segments.slice(0, 20);
    }
  }

  /**
  * Like a segment
  * @param {string} userId - The userId of the user liking the segment
  * @param {string} segmentId - The segmentId of the segment being liked
  * @returns Promise<Boolean> - Whether the segment was liked or not
  */
  static async likeSegment(userId: string, segmentId: Types.ObjectId | string): Promise<boolean> {
    const segment = await SegmentModel.findOne({ _id: segmentId});
    if (!segment.likes.includes(userId)) {
      const author = segment.authorId;
      UserCollection.incrementPublicity(author);
      segment.likes.push(userId);
      await segment.save();
      return true;
    }
    return false;
  }

  /**
   * Unlike a segment
   * @param {string} userId - The userId of the user unliking the segment
   * @param {string} segmentId - The segmentId of the segment being unliked
   * @returns Promise<Boolean> - Whether the segment was unliked or not
   */
  static async unlikeSegment(userId: string, segmentId: Types.ObjectId | string): Promise<boolean> {
    const segment = await SegmentModel.findOne({_id: segmentId});
    if (segment.likes.includes(userId)) {
      const author = segment.authorId;
      UserCollection.decrementPublicity(author);
      segment.likes.splice(segment.likes.indexOf(userId), 1);
      await segment.save();
      return true;
    }
    return false;
  }

  /** 
  * Get all the users who liked a segment
  * @param {string} segmentId - The segmentId of the segment
  * @returns {Promise<HydratedDocument<User>[]>} - The users who liked the segment 
  */
  static async getLikes(segmentId: Types.ObjectId | string): Promise<Array<String>> {
    const segment = await SegmentModel.findOne({ _id: segmentId });
    const likes = segment.likes;
    return likes;
  }
}

export default SegmentCollection;
