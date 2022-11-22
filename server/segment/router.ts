import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import SegmentCollection from './collection';
import * as userValidator from '../user/middleware';
import * as segmentValidator from './middleware';
import * as util from './util';

const router = express.Router();

/** 
 * Get all the segments in the collection
 * 
 * @name GET /api/segments
 * 
 * @returns {SegmentResponse[]} - A list of all the segments sorted by date published in descending order
*/
/**
 * Get segments by a given author
 * 
 * @name GET /api/segments?authorId=id
 * 
 * @return {SegmentResponse[]} - A list of all the segments by the author sorted by date published in descending order
 * @throws {400} - If the authorId is not given
 * @throws {404} - If the author is not found
 */

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.author !== undefined) {
      next();
      return;
    }

    const allSegments = await SegmentCollection.getAllSegments();
    const response = allSegments.map(util.constructSegmentResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorSegments = await SegmentCollection.getSegmentsByAuthor(req.query.author as string);
    const response = authorSegments.map(util.constructSegmentResponse);
    res.status(200).json(response);
  }
);

/** 
 * Create a new segment
 * 
 * @name POST /api/segments
 * 
 * @param {string} content - The content of the segment
 * @param {string} parent - The ID of the parent segment
 * @returns {SegmentResponse} - The newly created segment
 * @throws {400} - If the content is empty
 * @throws {403} - If the user is not logged in
*/
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    segmentValidator.validContent
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? "";
    const segment = await SegmentCollection.addSegment(userId, req.body.content, req.body.storyTitle, req.body.segmentTitle, null);

    res.status(201).json({
      message: "Your segment has been created successfully.",
      segment: util.constructSegmentResponse(segment)
    });
  }
);

export {router as segmentRouter};
