import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {Segment} from '../segment/model';


// Type definition for storySegment on the backend
export type Tree = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  root: Types.ObjectId;
  connections: Map<Segment, Segment>;
  datePublished: Date;
};

export type PopulatedTree = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  root: Segment;
  connections: Map<Segment, Segment>;
  datePublished: Date;
};


const TreeSchema = new Schema<Tree>({
  // The author userId
  root: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Segment'
  },
  //The mapping between a child segment to its parent
  connections: {
    type: Map,
    required: true,
    ref: 'Segment'
  },
  // The date the storySegment was published
  datePublished: {
    type: Date,
    required: true
  }
});

const TreeModel = model<Tree>('Tree', TreeSchema);
export default TreeModel;
