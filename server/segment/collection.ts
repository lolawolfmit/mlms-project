import type {HydratedDocument, Types} from 'mongoose';
import type {Segment} from './model';
import SegmentModel from './model';
import UserCollection from '../user/collection';

class SegmentCollection {
  /**
   * Add a new segment to the collection
   * @param {string} authorId - The author of the segment
   * @param {string} content - The content of the segment
   * @param {string} parent - The parent of the segment
   * @returns {Promise<HydratedDocument<Segment>>} - The newly created segment
   */
  static async addSegment(authorId: Types.ObjectId | string, content: string, storyTitle: string, segmentTitle: string, parent: Types.ObjectId | string): Promise<HydratedDocument<Segment>> {
    const segment = new SegmentModel({
      authorId,
      datePublished: new Date(),
      storyTitle,
      segmentTitle,
      content,
      parent
    });
    await segment.save();
    return segment.populate('authorId');
  }

  /**
   * Get all the segments in the collection
   * @returns {Promise<HydratedDocument<Segment>[]>} - All the segments in the collection
   */
  static async getAllSegments(): Promise<Array<HydratedDocument<Segment>>> {
    return SegmentModel.find({}).sort({datePublished: -1}).populate('authorId');
  }

  /**
   * Get a segment by segmentId
   * @param {string} segmentId - The segmentId of the segment to find
   * @returns {Promise<HydratedDocument<Segment>> | Promise<null} - The Segment
   */
  static async getSegmentByID(segmentId: Types.ObjectId | string): Promise<HydratedDocument<Segment>> {
    return SegmentModel.findOne({_id: segmentId}).populate('authorId');
  }

  /**
   * Get all segments by a given author
   * @param {string} username - The username of the author
   * @returns {Promise<HydratedDocument<Segment>[]>} - The segments by the author
   */
  static async getSegmentsByAuthor(username: string): Promise<Array<HydratedDocument<Segment>>> {
    const author = await UserCollection.findOneByUsername(username);
    return SegmentModel.find({authorId: author._id}).sort({datePublished: -1}).populate('authorId');
  }

  /** 
   * Get all the children of a segment
   * @param {string} parentId - The segmentId of the parent
   * @returns {Promise<HydratedDocument<Segment>[]>} - The children of the parent
  */
  static async getChildren(parentId: Types.ObjectId | string): Promise<Array<HydratedDocument<Segment>>> {
    return SegmentModel.find({parent: parentId}).sort({datePublished: -1}).populate('authorId');
  }
}

export default SegmentCollection;
