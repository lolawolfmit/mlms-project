import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import SegmentCollection from '../segment/collection';
import TreeCollection from './collection';

/**
 * Checks if a segment with the given segmentId exists
 */
const treeExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.treeId);
  const tree = validFormat ? await TreeCollection.getTreeByID(req.params.treeId) : "";
  if (!tree) {
    res.status(404).json({ 
      error: {
        segmentNotFound: `Tree with ID ${req.params.treeId} not found.` 
      }
    });
    return
  }
  next();
};


/**
 * Checks if a segment with the given segmentId exists
 */
 const parentExists = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.body.parentId);
    const parent = validFormat ? await SegmentCollection.getSegmentByID(req.body.parentId) : "";
    if (!parent) {
      res.status(404).json({ 
        error: {
          segmentNotFound: `Parent Segment with ID ${req.body.parentId} not found.` 
        }
      });
      return
    }
    next();
 };




/**
 * Checks if a segment with the given segmentId exists
 */
 const rootExists = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.body.rootId);
    const root = validFormat ? await SegmentCollection.getSegmentByID(req.body.rootId) : "";
    if (!root) {
      res.status(404).json({ 
        error: {
          segmentNotFound: `RootSegment with ID ${req.body.rootId} not found.` 
        }
      });
      return
    }
    next();
 };


 const rootExistQuery = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.rootId) {
        res.status(400).json({
            error: 'Provided root id must be nonempty.'
        });
        return;
    }
    
    const root = await SegmentCollection.getSegmentByID(req.query.rootId as string);
    if (!root) {
    res.status(404).json({
        error: `This root segment with does not exist.`
    });
    return;
    }

    next();
 };

/**
 * Checks if a segment with the given segmentId exists
 */
 const childExists = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.body.childId);
    const child = validFormat ? await SegmentCollection.getSegmentByID(req.body.childId) : "";
    if (!child) {
      res.status(404).json({ 
        error: {
          segmentNotFound: `Child Segment with ID ${req.body.childId} not found.` 
        }
      });
      return
    }
    next();
 }

export {
    treeExists,
    rootExists,
    parentExists,
    rootExistQuery,
    childExists
};

