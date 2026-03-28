const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Chat = require('../models/Chat');
const { extractText } = require('../utils/fileParser');
const { analyzeDocument } = require('../services/aiService');

// ─── Multer configuration ────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, TXT, and CSV files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// ─── Export multer middleware for the route ──────────────────
const uploadMiddleware = upload.single('file');

// @desc   Upload a file, analyze it, save result to active chat
// @route  POST /api/upload
// @access Protected
const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { chatId } = req.body;
    if (!chatId) {
        return res.status(400).json({ message: 'chatId is required' });
    }

    try {
        console.log(`📄 Extracting text from: ${req.file.originalname}`);
        const fileText = await extractText(req.file);
        console.log(`✅ Extracted ${fileText.length} characters`);

        // Generate AI analysis
        const aiContent = await analyzeDocument(fileText, req.file.originalname, req.user);

        // Save both user attachment message and AI analysis to the chat
        const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
        if (!chat) return res.status(404).json({ message: 'Chat session not found' });

        const userMessage = {
            role: 'user',
            content: `[Attached document: **${req.file.originalname}**]`,
            attachmentName: req.file.originalname,
            timestamp: new Date(),
        };

        const aiMessage = {
            role: 'model',
            content: aiContent,
            attachmentName: null,
            timestamp: new Date(),
        };

        chat.messages.push(userMessage, aiMessage);

        // Auto-rename if default title
        if (chat.title === 'New Consultation') {
            chat.title = `Analysis: ${req.file.originalname.substring(0, 30)}`;
        }

        await chat.save();

        const savedMsgs = chat.messages.slice(-2);
        const fmt = (msg) => ({
            id: msg._id.toString(),
            isAi: msg.role === 'model',
            content: msg.content,
            attachmentName: msg.attachmentName || null,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Clean up temp file
        fs.unlink(req.file.path, () => { });

        res.status(201).json({
            chatId: chat._id.toString(),
            title: chat.title,
            userMessage: fmt(savedMsgs[0]),
            aiMessage: fmt(savedMsgs[1]),
        });
    } catch (err) {
        console.error('uploadFile error:', err.message);
        if (req.file) fs.unlink(req.file.path, () => { });
        res.status(500).json({ message: err.message || 'Server error during file analysis' });
    }
};

module.exports = { uploadMiddleware, uploadFile };
