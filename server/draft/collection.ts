import type { HydratedDocument, Types } from 'mongoose';
import type { Draft } from './model';
import DraftModel from './model';
import {Segment} from '../segment/model';
import UserCollection from '../user/collection';
import SegmentCollection from '../segment/collection';
import type {User} from '../user/model';

class DraftCollection {
  /**
   * Add a new segment to the collection
   * @param {string} authorId - The author of the segment
   * @param {string} content - The content of the segment
   * @param {string} parent - The parent of the segment
   * @returns {Promise<HydratedDocument<Segment>>} - The newly created segment
   */
  static async addDraft(authorId: Types.ObjectId | string, content: string, storyTitle: string, segmentTitle: string, parent: Types.ObjectId | null): Promise<HydratedDocument<Draft>> {
    const draft = new DraftModel({
      authorId,
      lastModified: new Date(),
      storyTitle,
      segmentTitle,
      content,
      parent,
      storyPart: parent == null ? 1 : (await SegmentCollection.getSegmentByID(parent)).storyPart + 1
    });
    await draft.save();
    console.log("finished");
    return draft.populate('authorId');
  }

  /**
   * Get all the segments in the collection
   * @returns {Promise<HydratedDocument<Segment>[]>} - All the segments in the collection
   */
  static async getAllDrafts(): Promise<Array<HydratedDocument<Draft>>> {
    return DraftModel.find({}).sort({ lastModified: -1 }).populate('authorId');
  }

  /**
   * Get a segment by segmentId
   * @param {string} segmentId - The segmentId of the segment to find
   * @returns {Promise<HydratedDocument<Segment>> | Promise<null>} - The Segment
   */
  static async getDraftByID(draftId: Types.ObjectId | string): Promise<HydratedDocument<Draft>> {
    return DraftModel.findOne({ _id: draftId }).populate('authorId');
  }

  /**
   * Get all segments by a given author
   * @param {string} username - The username of the author
   * @returns {Promise<HydratedDocument<Segment>[]>} - The segments by the author
   */
  static async getDraftsByAuthor(username: string): Promise<Array<HydratedDocument<Draft>>> {
    const author = await UserCollection.findOneByUsername(username);
    return DraftModel.find({ authorId: author._id }).sort({ datePublished: -1 }).populate('authorId');
  }


  static async editDraftContent(draftId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Draft>>{
    const draft = await this.getDraftByID(draftId);
    draft.content = content;
    draft.lastModified = new Date();

    draft.save();
    return draft;
  }


  static async editDraftStoryTitle(draftId: Types.ObjectId | string, storyTitle: string): Promise<HydratedDocument<Draft>>{
    const draft = await this.getDraftByID(draftId);
    draft.storyTitle = storyTitle;
    draft.lastModified = new Date();

    draft.save();
    return draft;
  }

  static async editDraftSegmentTitle(draftId: Types.ObjectId | string, segmentTitle: string): Promise<HydratedDocument<Draft>>{
    const draft = await this.getDraftByID(draftId);
    draft.segmentTitle = segmentTitle;
    draft.lastModified = new Date();

    draft.save();
    return draft;
  }


  static async deleteDraft(draftId: Types.ObjectId | string): Promise<void>{
    await DraftModel.deleteOne({_id: draftId});
  }

  static async publishDraft(draftId: Types.ObjectId | string): Promise<HydratedDocument<Segment>>{
    const draft = await this.getDraftByID(draftId);
    const segment = await SegmentCollection.addSegment(draft.authorId, draft.content, draft.storyTitle, draft.segmentTitle, draft.parent);

    await this.deleteDraft(draftId);

    return segment;

  }
}


export default DraftCollection;
