const express = require('express');
const multer = require('multer');
console.log('multer loaded:', typeof multer);
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

const uploadResumeMiddleware = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Resume file must be 2MB or smaller' });
    }
    return res.status(400).json({ error: err.message || 'Resume upload failed' });
  });
};

router.use(authMiddleware);

router.post('/start', startInterview);
router.post('/upload-resume', uploadResumeMiddleware, uploadResume);
router.post('/submit', submitInterview);
router.post('/transcribe', transcribeAudio);  // must be before /:id
router.get('/history', getHistory);
router.get('/:id', getSession);               // wildcard always last

module.exports = router;
