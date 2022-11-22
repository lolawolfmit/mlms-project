import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import SegmentCollection from './collection';

/**
 * Checks if a segment with the given segmentId exists
 */
const segmentExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.segmentId);
  const segment = validFormat ? await SegmentCollection.getSegmentByID(req.params.segmentId) : "";
  if (!segment) {
    res.status(404).json({ 
      error: {
        segmentNotFound: `Segment with ID ${req.params.segmentId} not found.` 
      }
    });
    return
  }
  next();
};

/**
 * Checks if the content of the segment is valid (not empty)
 */
const validContent = (req: Request, res: Response, next: NextFunction) => {
  const {content} = req.body as {content: string};
  if (!content.trim()) {
    res.status(400).json({
      error: {
        invalidContent: "Story segment cannot be empty."
      }
    });
    return;
  }
  next();
}

export {
  segmentExists,
  validContent
};

