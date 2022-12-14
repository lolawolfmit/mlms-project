import type { HydratedDocument, Types } from 'mongoose';
import type { Draft } from './model';
import DraftModel from './model';
import {Segment} from '../segment/model';
import UserCollection from '../user/collection';
import SegmentCollection from '../segment/collection';
import type {User} from '../user/model';

class DraftCollection {
  /**
   * Add a new draft to the collection
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
    return draft.populate('authorId');
  }

  /**
   * Get all the drafts in the collection
   * @returns {Promise<HydratedDocument<Draft>[]>} - All the segments in the collection
   */
  static async getAllDrafts(): Promise<Array<HydratedDocument<Draft>>> {
    return DraftModel.find({}).sort({ lastModified: -1 }).populate('authorId');
  }

  /**
   * Get a draft by draftId
   * @param {string} segmentId - The segmentId of the segment to find
   * @returns {Promise<HydratedDocument<Draft>> | Promise<null>} - The Segment
   */
  static async getDraftByID(draftId: Types.ObjectId | string): Promise<HydratedDocument<Draft>> {
    return DraftModel.findOne({ _id: draftId }).populate('authorId');
  }

  /**
   * Get all draft by a given author
   * @param {string} username - The username of the author
   * @returns {Promise<HydratedDocument<Segment>[]>} - The segments by the author
   */
  static async getDraftsByAuthor(username: string): Promise<Array<HydratedDocument<Draft>>> {
    const author = await UserCollection.findOneByUsername(username);
    return DraftModel.find({ authorId: author._id }).sort({ lastModified: -1 }).populate('authorId');
  }

/**
 * edit the content of the draft
 * @param draftId id of the draft
 * @param content content to update draft.content with
 * @returns updated draft
 */
  static async editDraftContent(draftId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Draft>>{
    const draft = await this.getDraftByID(draftId);
    draft.content = content;
    draft.lastModified = new Date();

    draft.save();
    return draft;
  }

/**
 * edit the storyTitle of the draft
 * @param draftId id of the draft
 * @param storyTitle storyTitle to update title of story with
 * @returns updated draft
 */
  static async editDraftStoryTitle(draftId: Types.ObjectId | string, storyTitle: string): Promise<HydratedDocument<Draft>>{
    const draft = await this.getDraftByID(draftId);
    draft.storyTitle = storyTitle;
    draft.lastModified = new Date();

    draft.save();
    return draft;
  }

  /**
 * edit the segmentTitle of the draft
 * @param draftId id of the draft
 * @param segmentTitle segmentTitle to update title of segment with
 * @returns updated draft
 */
  static async editDraftSegmentTitle(draftId: Types.ObjectId | string, segmentTitle: string): Promise<HydratedDocument<Draft>>{
    const draft = await this.getDraftByID(draftId);
    draft.segmentTitle = segmentTitle;
    draft.lastModified = new Date();

    draft.save();
    return draft;
  }

/**
 * 
 * @param draftId id of the draft
 * @param segmentTitle new segmentTitle to replace title of segment
 * @param storyTitle new storyTitle to repalce title of story
 * @param content new content to replace the content with
 * @returns updated draft
 */
  static async editDraft(draftId: Types.ObjectId | string, segmentTitle: string, storyTitle: string, content: string): Promise<HydratedDocument<Draft>>{
    const draft = await this.getDraftByID(draftId);
    draft.segmentTitle = segmentTitle;
    draft.storyTitle = storyTitle;
    draft.content = content;
    draft.lastModified = new Date();

    draft.save();
    return draft;
  }

  /**
   * delete draft
   * @param draftId id of draft
   */
  static async deleteDraft(draftId: Types.ObjectId | string): Promise<void>{
    await DraftModel.deleteOne({_id: draftId});
  }

  /**
   * publish draft as segment, delete draft
   * @param draftId id of draft
   * @returns segment
   */
  static async publishDraft(draftId: Types.ObjectId | string): Promise<HydratedDocument<Segment>>{
    const draft = await this.getDraftByID(draftId);
    const segment = await SegmentCollection.addSegment(draft.authorId, draft.content, draft.storyTitle, draft.segmentTitle, draft.parent);

    await this.deleteDraft(draftId);

    return segment;

  }
}


export default DraftCollection;
