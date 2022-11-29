import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Tree, PopulatedTree} from './model';

type TreeResponse = {
  _id: string;
  root: string;
  connections: string;
  datePublished: string;
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
 * @param {HydratedDocument<Tree>} tree
 * @returns {TreeResponse}
 */
const constructTreeResponse = (tree: HydratedDocument<Tree>): TreeResponse => {
  const treeCopy: PopulatedTree = {
    ...tree.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {storyTitle} = treeCopy.root;
  delete treeCopy.root;
  return {
    ...treeCopy,
    _id: treeCopy._id.toString(),
    root: storyTitle,
    connections: treeCopy.connections.toString(),
    datePublished: formatDate(tree.datePublished)
  };
};

export {
  constructTreeResponse
};
