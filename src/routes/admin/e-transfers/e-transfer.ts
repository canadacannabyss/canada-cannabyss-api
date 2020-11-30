import { Router } from 'express'
const router = Router()

import {
  index,
  create,
  deleteETransfer,
  validateRecipientEmail,
} from '../../../controllers/admin/e-transfers/e-transfers'

router.get('', index)

router.get('/validation/recipientEmail/:recipientEmail', validateRecipientEmail)

router.post('/create', create)

router.put('/delete/e-transfer/:id', deleteETransfer)

export default router
