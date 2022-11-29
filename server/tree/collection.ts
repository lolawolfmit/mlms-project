import type {HydratedDocument, Types} from 'mongoose';
import type {Tree} from './model';
import type {Segment} from '../Segment/model';
import TreeModel from './model';
import UserCollection from '../user/collection';
import SegmentCollection from '../segment/collection';

class TreeCollection {
  /**
   * Add a new tree to the collection
   * @param {string} authorId - The author of the segment
   * @param {string} content - The content of the segment
   * @param {string} parent - The parent of the segment
   * @returns {Promise<HydratedDocument<Segment>>} - The newly created segment
   */
  static async addTree(root: Types.ObjectId | string): Promise<HydratedDocument<Tree>> {
    const connections = new Map<Segment, Segment>();
    const tree = new TreeModel({
      root,
      connections,
      datePublished: new Date()
    });
    await tree.save();
    return tree.populate('root');
  }

  /**
   * Get all the segments in the collection
   * @returns {Promise<HydratedDocument<Segment>[]>} - All the segments in the collection
   */
  static async getAllTrees(): Promise<Array<HydratedDocument<Tree>>> {
    return TreeModel.find({}).sort({datePublished: -1}).populate('root');
  }

  /**
   * Get a segment by segmentId
   * @param {string} segmentId - The segmentId of the segment to find
   * @returns {Promise<HydratedDocument<Segment>> | Promise<null} - The Segment
   */
  static async getTreeByID(treeId: Types.ObjectId | string): Promise<HydratedDocument<Tree>> {
    return TreeModel.findOne({_id: treeId}).populate('root');
  }

  /**
   * TODO:
   * debug
   */
  static async getTreeByRootId(rootId: Types.ObjectId | string): Promise<Array<HydratedDocument<Tree>>> {
    const rootSegment = await SegmentCollection.getSegmentByID(rootId);
    return TreeModel.findOne({root: rootSegment._id});
  }

  /** 
   * Get all the children of a segment
   * @param {string} parentId - The segmentId of the parent
   * @returns {Promise<HydratedDocument<Segment>[]>} - The children of the parent
  */
  static async addConnection(treeId: Types.ObjectId | string, parentId: Types.ObjectId | string, childId: Types.ObjectId | string): Promise<HydratedDocument<Tree>> {
    const tree = await this.getTreeByID(treeId);
    const parentSegment = await SegmentCollection.getSegmentByID(parentId);
    const childSegment = await SegmentCollection.getSegmentByID(childId);
    tree.connections.set(parentSegment, childSegment);

    await tree.save();
    return tree.populate('root');;
  }
}

export default TreeCollection;
