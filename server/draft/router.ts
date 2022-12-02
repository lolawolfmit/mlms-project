import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import DraftCollection from './collection';
import * as userValidator from '../user/middleware';
import * as draftValidator from './middleware';
import * as util from './util';
import SegmentModel from './model';

const router = express.Router();


/**
 * Get segments by a given author
 * 
 * @name GET /api/drafts?authorId=id
 * 
 * @return {DraftResponse[]} - A list of all the segments by the author sorted by date published in descending order
 * @throws {400} - If the authorId is not given
 * @throws {404} - If the author is not found
 */

router.get(
  '/',
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
router.patch(
    '/:draftId?',
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.segmentTitle || req.body.storyTitle) next('route');
        else next();
    },
    [
        userValidator.isUserLoggedIn,
        draftValidator.validDraftModifier
    ],
    async (req: Request, res: Response) => {
        const draft= await DraftCollection.editDraftContent(req.params.itemForSaleId, req.body.content);
        res.status(200).json({
            message: 'Your draft content was updated successfully.',
            draft: util.constructDraftResponse(draft)
        });
    }
);
  
  
router.patch(
    '/:draftId?',
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.segmentTitle) next('route');
        else next();
    },
    [
        userValidator.isUserLoggedIn,
        draftValidator.validDraftModifier
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const draft = await DraftCollection.editDraftStoryTitle(req.params.draftId, req.body.storyTitle);
        res.status(200).json({
            message: 'Your segment Title was updated successfully.',
            draft: util.constructDraftResponse(draft)
        });
    }
);
  
//edit segmentTitle
router.patch(
    '/:draftId?',
    [
        userValidator.isUserLoggedIn,
        draftValidator.validDraftModifier
    ],
    async (req: Request, res: Response, next: NextFunction) => {
    const draft = await DraftCollection.editDraftSegmentTitle(req.params.draftId, req.body.segmentTitle);
    res.status(200).json({
        message: 'Your story title was updated successfully.',
        draft: util.constructDraftResponse(draft)
    });
    }
);


//delete a draft, no publishing
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

//publish a draft
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




//delete draft
//publish draft
//edit draft
export {router as draftRouter};
