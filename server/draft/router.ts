import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import DraftCollection from './collection';
import * as userValidator from '../user/middleware';
import * as draftValidator from './middleware';
import * as util from './util';
import SegmentModel from './model';

const router = express.Router();


/**
 * Get drafts by a given author
 * 
 * @name GET /api/drafts?authorId=id
 * 
 * @return {DraftResponse[]} - A list of all the segments by the author sorted by date published in descending order
 * @throws {400} - If the authorId is not given
 * @throws {404} - If the author is not found
 */

router.get(
  '/:author?',
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorDrafts = await DraftCollection.getDraftsByAuthor(req.query.author as string);
    const response = authorDrafts.map(util.constructDraftResponse);
    res.status(200).json(response);
  }
);


/** 
 * Create a new draft
 * 
 * @name POST /api/drafts
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
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? "";
    const draft = await DraftCollection.addDraft(userId, req.body.content, req.body.storyTitle, req.body.segmentTitle, req.body.parent);
    res.status(201).json({
      message: "Your draft has been created successfully.",
      draft: util.constructDraftResponse(draft)
    });
  }
);



//PATCH draft
/**
 * @name PATCH /api/drafts/:id
 * 
 * edit draft segmentTitle, content, and storyTitle
 * @returns {SegmentResponse} - The newly edited segment
 * @throws {400} - If the content is empty
 * @throws {403} - If the user is not logged in
 * 
 */
router.patch(
    '/:draftId?',
    [
        userValidator.isUserLoggedIn,
        draftValidator.validDraftModifier
    ],
    async (req: Request, res: Response) => {
        const draft= await DraftCollection.editDraft(req.params.draftId, req.body.segmentTitle, req.body.storyTitle, req.body.content);

        res.status(200).json({
            message: 'Your draft content was updated successfully.',
            draft: util.constructDraftResponse(draft)
        });
    }
);
  

/**
 * Delete a draft
 *
 * @name DELETE /api/drafts/:id
 *
 * @param {string} draftId - id of draft to delete
 * @return {string} - A success message
 * @throws {405} - user is trying to publish another person's draft
 * @throws {403} - If the user is not logged in
 */
router.delete(
    '/:draftId?',
    [
        userValidator.isUserLoggedIn,
        draftValidator.validDraftModifier
    ],
    async (req: Request, res: Response) => {
      await DraftCollection.deleteDraft(req.params.draftId);
      res.status(200).json({
        message: 'Your draft was deleted successfully.'
      }); 
    }
);




/** 
 * Publish a draft so that it is a segment now
 * 
 * @name POST /api/drafts/:id
 * 
 * @throws {405} - user is trying to publish another person's draft
 * @throws {403} - If the user is not logged in
*/
router.post(
    '/:draftId?',
    [
        userValidator.isUserLoggedIn,
        draftValidator.validDraftModifier
    ],
    async (req: Request, res: Response) => {
      await DraftCollection.publishDraft(req.params.draftId);
      res.status(200).json({
        message: 'Your draft was published successfully.'
      }); 
    }
);





export {router as draftRouter};
