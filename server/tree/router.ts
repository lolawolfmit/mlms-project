import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import TreeCollection from './collection';
import * as userValidator from '../user/middleware';
import * as treeValidator from './middleware';
import * as util from './util';
import SegmentCollection from '../segment/collection';
import { Types } from 'mongoose';

const router = express.Router();

/** 
 * Get all the segments in the collection
 * 
 * @name GET /api/trees
 * 
 * @returns {TreeResponse[]} - A list of all the segments sorted by date published in descending order
*/
/**
 * Get segments by a given author
 * 
 * @name GET /api/segments?rootId=id
 * 
 * @return {TreeResponse[]} - A list of all the segments by the author sorted by date published in descending order
 * @throws {400} - If the treeId is not given
 * @throws {404} - If the treeId is not found
 */

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.rootId !== undefined) {
      next();
      return;
    }

    const allTrees = await TreeCollection.getAllTrees();
    const response = allTrees.map(util.constructTreeResponse);
    res.status(200).json(response);
  },
  [ 
    treeValidator.rootExistQuery
  ],
  async (req: Request, res: Response) => {
    const tree = await TreeCollection.getTreeByRootId(req.query.rootId as string);
    const response = tree.map(util.constructTreeResponse);
    res.status(200).json(response);
  }
);

/** 
 * Create a new tree
 * 
 * @name POST /api/trees
 * 
 * @param {string} root - The root of the tree
 * @returns {SegmentResponse} - The newly created segment
 * @throws {404} - if root does not exist
*/
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    treeValidator.rootExists
  ],
  async (req: Request, res: Response) => {
    //const root= await SegmentCollection.getSegmentByID(req.body.rootId);
    const tree = await TreeCollection.addTree(req.body.rootId);

    res.status(201).json({
      message: "Your segment has been created successfully.",
      segment: util.constructTreeResponse(tree)
    });
  }
);


/** 
 * Create a new tree
 * 
 * @name PATCH /api/trees/:treeId=id
 * 
 * @param {string} root - The root of the tree
 * @returns {SegmentResponse} - The newly created segment
 * @throws {404} - if root does not exist
 * @throws {404} - if child does not exist
 * @throws {404} - if parent does not exist
*/
router.patch(
    '/:treeId',
    [
      userValidator.isUserLoggedIn,
      treeValidator.treeExists,
      treeValidator.childExists,
      treeValidator.parentExists
    ],
    async (req: Request, res: Response) => {
      //const root= await SegmentCollection.getSegmentByID(req.body.rootId);
    //   const tree = await TreeCollection.getTreeByID(req.params.rootId as string);
    //   const child = await SegmentCollection.getSegmentByID(req.body.childId);
    //   const parent = await SegmentCollection.getSegmentByID(req.body.parentId);
      const tree = await TreeCollection.addConnection(req.params.treeId, req.body.parentId, req.body.childId);
  
      res.status(201).json({
        message: "Your segment has been created successfully.",
        segment: util.constructTreeResponse(tree)
      });
    }
);


export {router as treeRouter};
