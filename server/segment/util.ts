import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Segment, PopulatedSegment} from './model';
import UserModel from '../user/model';
import type {User} from '../user/model';

type SegmentResponse = {
  _id: string;
  author: string;
  datePublished: string;
  storyTitle: string;
  segmentTitle: string;
  content: string;
  parent: string;
  likes: Array<String>;
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
 * @param {HydratedDocument<Segment>} segment
 * @returns {SegmentResponse}
 */
const constructSegmentResponse = (segment: HydratedDocument<Segment>): SegmentResponse => {
  const segmentCopy: PopulatedSegment = {
    ...segment.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = segmentCopy.authorId;
  delete segmentCopy.authorId;
  return {
    ...segmentCopy,
    _id: segmentCopy._id.toString(),
    author: username,
    datePublished: formatDate(segment.datePublished),
    storyTitle: segment.storyTitle,
    segmentTitle: segment.segmentTitle,
    parent: segmentCopy.parent? segmentCopy.parent.toString() : "none",
    likes: segmentCopy.likes
  };
};

export {
  constructSegmentResponse
};
