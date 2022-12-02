import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Draft, PopulatedDraft} from './model';
import UserModel from '../user/model';
import type {User} from '../user/model';

type DraftResponse = {
  _id: string;
  author: string;
  lastModified: string;
  storyTitle: string;
  segmentTitle: string;
  content: string;
  parent: string;
  storyPart: number;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Freet object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Draft>} draft
 * @returns {DraftResponse}
 */
const constructDraftResponse = (draft: HydratedDocument<Draft>): DraftResponse => {
  const draftCopy: PopulatedDraft = {
    ...draft.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = draftCopy.authorId;
  delete draftCopy.authorId;
  return {
    ...draftCopy,
    _id: draftCopy._id.toString(),
    author: username,
    lastModified: formatDate(draft.lastModified),
    storyTitle: draft.storyTitle,
    segmentTitle: draft.segmentTitle,
    parent: draftCopy.parent? draftCopy.parent.toString() : "none",
    storyPart: draftCopy.storyPart
  };
};

export {
  constructDraftResponse
};
