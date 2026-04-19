const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  startInterview,
  submitInterview,
  getHistory,
  getSession,
  transcribeAudio,
  uploadResume,
} = require('../controllers/interviewController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  },
});

router.use(authMiddleware);

router.post('/start', startInterview);
router.post('/upload-resume', upload.single('resume'), uploadResume);
router.post('/submit', submitInterview);
router.post('/transcribe', transcribeAudio);  // must be before /:id
router.get('/history', getHistory);
router.get('/:id', getSession);               // wildcard always last

module.exports = router;
