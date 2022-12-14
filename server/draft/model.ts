import {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';


// Type definition for storySegment on the backend
export type Draft = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: Types.ObjectId; // username of the author
  lastModified: Date;
  storyTitle: string;
  segmentTitle: string;
  content: string;
  parent: Types.ObjectId;
  storyPart: number;
};

export type PopulatedDraft = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: User; // username of the author
  lastModified: Date;
  storyTitle: string;
  segmentTitle: string;
  content: string;
  parent: Types.ObjectId;
  storyPart: number;
};


const DraftSchema = new Schema<Draft>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The date the storySegment was published
  lastModified: {
    type: Date,
    required: true
  },
  // The title of the story
  storyTitle: {
    type: String,
    required: true
  },
  // The title of the draft
  segmentTitle: {
    type: String,
    required: true
  },
  // The content of the draft segment
  content: {
    type: String,
    required: true
  },
  // The parent of the draft
  parent: {
    type: Schema.Types.ObjectId,
    required: false
  },

  storyPart: {
    type: Number,
    required: true
  }
});

const DraftModel = model<Draft>('Draft', DraftSchema);
export default DraftModel;
