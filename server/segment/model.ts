import {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';


// Type definition for storySegment on the backend
export type Segment = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: Types.ObjectId; // username of the author
  datePublished: Date;
  storyTitle: string;
  segmentTitle: string;
  content: string;
  parent: Types.ObjectId;
  likes: Array<String>;
  storyPart: number;
};

export type PopulatedSegment = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: User; // username of the author
  datePublished: Date;
  storyTitle: string;
  segmentTitle: string;
  content: string;
  parent: Types.ObjectId;
  likes: Array<String>;
  storyPart: number;
};


const SegmentSchema = new Schema<Segment>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The date the storySegment was published
  datePublished: {
    type: Date,
    required: true
  },
  // The title of the story
  storyTitle: {
    type: String,
    required: true
  },
  // The title of the segment
  segmentTitle: {
    type: String,
    required: true
  },
  // The content of the story segment
  content: {
    type: String,
    required: true
  },
  // The parent of the segment
  parent: {
    type: Schema.Types.ObjectId,
    required: false
  },
  // the usernames of users that liked the segment
  likes: {
    type: Array<String>(),
    required: true
  },
  // The part of the story the segment is in
  storyPart: {
    type: Number,
    required: true
  }
});

const SegmentModel = model<Segment>('Segment', SegmentSchema);
export default SegmentModel;
