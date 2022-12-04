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
      error: `Segment with ID ${req.params.segmentId} not found.` 
    });
    return
  }
  next();
};

/**
 * Checks if the content of the segment is valid (not empty)
 */
const validContent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.storyTitle.trim()) {
    res.status(400).json({
      error: "Story title cannot be empty."
    });
    return;
  }
  else if (req.body.storyTitle.length > 50) {
    res.status(400).json({
      error: "Story title cannot be longer than 50 characters."
    });
    return;
  }
  else if (!req.body.segmentTitle.trim()) {
    res.status(400).json({
      error: "Segment title cannot be empty."
    });
    return;
  }
  else if (req.body.segmentTitle.length > 50) {
    res.status(400).json({
      error: "Segment title cannot be longer than 50 characters."
    });
    return;
  }
  else if (!req.body.content.trim()) {
    res.status(400).json({
      error: "Segment content cannot be empty."
    });
    return;
  }

  next();
}

export {
  segmentExists,
  validContent
};

