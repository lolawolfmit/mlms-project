import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import SegmentCollection from './collection';
import * as userValidator from '../user/middleware';
import * as segmentValidator from './middleware';
import * as util from './util';
import SegmentModel from './model';

const router = express.Router();

/** 
 * Get all the segments in the collection
 * 
 * @name GET /api/segment
 * 
 * @returns {SegmentResponse[]} - A list of all the segments sorted by date published in descending order
*/
/**
 * Get segments by a given author
 * 
 * @name GET /api/segment?authorId=id
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
 * Get a segment's children
 * 
 * @name GET /api/segment
 * 
 * @return {SegmentResponse[]} - A list of all the children of the parent sorted by date published in descending order
 * @throws {400} - If the parentId is not given
 * @throws {404} - If the parent is not found
 * @throws {404} - If the parent is not a segment
 */
router.get(
  '/children?parentId=id',
  [
    userValidator.isUserLoggedIn,
    segmentValidator.segmentExists,
  ],
  async (req: Request, res: Response) => {
    const children = await SegmentCollection.getChildren(req.params.parentId as string);
    const response = children.map(util.constructSegmentResponse);
    res.status(200).json(response);
  }
)

/**
 * Get a user's homepage 
 * 
 * @name GET /api/segment/homepage?filter=keyword1,keyword2...
 * 
 * @returns {SegmentResponse[]} - A list of all the segments in the user's homepage sorted by date published in descending order
 * @throws {401} - If the user is not logged in
 * @throws {404} - If the user is not found
 */

router.get(
  '/homepage',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.filter !== undefined) {
      next();
      return;
    }

    const homepage = await SegmentCollection.getHomepage(req.session.userId, "");
    const response = homepage.map(util.constructSegmentResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    const homepage = await SegmentCollection.getHomepage(req.session.userId, req.query.filter as string);
    const response = homepage.map(util.constructSegmentResponse);
    res.status(200).json(response);
  }
);

/** 
 * Create a new segment
 * 
 * @name POST /api/segment
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

/**
 * Like a segment
 * 
 * @name PATCH /api/segment/like
 * 
 * @param {string} segmentId - The ID of the segment to like
 * @returns a success message
 * @throws {400} - If the segmentId is not given
 * @throws {403} - If the user is not logged in
 * @throws {409} - If the user has already liked the segment
 */
router.patch(
  '/like',
  [
    userValidator.isUserLoggedIn,
    segmentValidator.segmentExists,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? "";
    const segmentId = req.body.segmentId;
    console.log(req.body);
    const segment = await SegmentModel.findById({ _id: segmentId });
    const likes = segment.likes;
    // if the user hasn't liked the segment yet, add the user to the likes array
    if (!likes.includes(userId)) {
      SegmentCollection.likeSegment(segmentId, userId);
      res.status(200).json({
        message: "You have liked this segment."
      });
    // if the user has already liked the segment, remove the user from the likes array
    } else {
      SegmentCollection.unlikeSegment(segmentId, userId);
      res.status(200).json({
        message: "You have unliked this segment."
      });
    }
  }
);

/** 
 * Get all likes for a segment
 * 
 * @name GET /api/segment/getlikes
 * 
 * @param {string} segmentId - The ID of the segment to get likes for
 * @returns {string[]} - A list of all the users who have liked the segment
 * @throws {400} - If the segmentId is not given
 * @throws {404} - If the segment is not found 
*/
router.get(
  '/likes',
  [
    userValidator.isUserLoggedIn,
    segmentValidator.segmentExists,
  ],
  async (req: Request, res: Response) => {
    const segmentId = req.body.segmentId;
    const segment = await SegmentModel.findById({ _id: segmentId });
    const likes = segment.likes;
    res.status(200).json(likes);
  }
)

export {router as segmentRouter};
