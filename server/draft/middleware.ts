import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import DraftCollection from './collection';
import UserCollection from '../user/collection';

/**
 * Checks if a segment with the given segmentId exists
 */
const draftExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.draftId);
  const draft = validFormat ? await DraftCollection.getDraftByID(req.params.draftId) : "";
  if (!draft) {
    res.status(404).json({ 
      error: {
        draftNotFound: `Draft with ID ${req.params.draftId} not found.` 
      }
    });
    return
  }
  next();
};

const validDraftModifier = async (req: Request, res: Response, next: NextFunction) => {
  const draft = await DraftCollection.getDraftByID(req.params.draftId);
  const author = await UserCollection.findOneByUserId(draft.authorId._id);
  const user = await UserCollection.findOneByUserId(req.session.userId);
  if (user.username !== author.username){
    res.status(405).json({ 
      error: {
        authorValidationError: `You cannot edit another author's story.` 
      }
    });
    return
  }
  next();
};


export {
    draftExists,
    validDraftModifier
  };