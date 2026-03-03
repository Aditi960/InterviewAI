const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  startInterview,
  submitInterview,
  getHistory,
  getSession,
  transcribeAudio,
} = require('../controllers/interviewController');

router.use(authMiddleware);

router.post('/start', startInterview);
router.post('/submit', submitInterview);
router.post('/transcribe', transcribeAudio);  // must be before /:id
router.get('/history', getHistory);
router.get('/:id', getSession);               // wildcard always last

module.exports = router;