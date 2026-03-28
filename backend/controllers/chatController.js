const Chat = require('../models/Chat');
const { generateFinancialAdvice } = require('../services/aiService');

// Helper to format a chat document for the frontend
const formatChat = (chat) => ({
    id: chat._id.toString(),
    title: chat.title,
    messages: chat.messages.map((msg) => ({
        id: msg._id.toString(),
        isAi: msg.role === 'model',
        content: msg.content,
        attachmentName: msg.attachmentName || null,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        }),
    })),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
});

// @desc   Get all chat sessions for the current user
// @route  GET /api/chats
// @access Protected
const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ user: req.user._id })
            .sort({ updatedAt: -1 })
            .select('-messages'); // Don't load messages in list view for performance

        res.json(
            chats.map((chat) => ({
                id: chat._id.toString(),
                title: chat.title,
                messages: [], // loaded separately on demand
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
            }))
        );
    } catch (error) {
        console.error('getChats error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc   Get a single chat session with all messages
// @route  GET /api/chats/:id
// @access Protected
const getChatById = async (req, res) => {
    try {
        const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
        if (!chat) {
            return res.status(404).json({ message: 'Chat session not found' });
        }
        res.json(formatChat(chat));
    } catch (error) {
        console.error('getChatById error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc   Create a new chat session
// @route  POST /api/chats
// @access Protected
const createChat = async (req, res) => {
    try {
        const chat = await Chat.create({
            user: req.user._id,
            title: 'New Consultation',
            messages: [],
        });
        res.status(201).json(formatChat(chat));
    } catch (error) {
        console.error('createChat error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc   Rename a chat session
// @route  PUT /api/chats/:id/title
// @access Protected
const renameChat = async (req, res) => {
    const { title } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title is required' });
    }
    try {
        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { title: title.trim() },
            { new: true, runValidators: true }
        ).select('-messages');

        if (!chat) {
            return res.status(404).json({ message: 'Chat session not found' });
        }
        res.json({ id: chat._id.toString(), title: chat.title });
    } catch (error) {
        console.error('renameChat error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc   Delete a chat session
// @route  DELETE /api/chats/:id
// @access Protected
const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!chat) {
            return res.status(404).json({ message: 'Chat session not found' });
        }
        res.json({ message: 'Chat session deleted', id: req.params.id });
    } catch (error) {
        console.error('deleteChat error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc   Add a user message and get a real Gemini AI response
// @route  POST /api/chats/:id/messages
// @access Protected
const addMessage = async (req, res) => {
    const { content, attachmentName } = req.body;

    if (!content && !attachmentName) {
        return res.status(400).json({ message: 'Message content is required' });
    }

    try {
        const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
        if (!chat) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        // --- 1. Save the user message ---
        const userMessage = {
            role: 'user',
            content: content || `[Attached: ${attachmentName}]`,
            attachmentName: attachmentName || null,
            timestamp: new Date(),
        };
        chat.messages.push(userMessage);

        // --- 2. Auto-rename if it's still the default title ---
        if (chat.title === 'New Consultation' && content) {
            chat.title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
        }

        // --- 3. Generate real AI response via Gemini + live ET RSS context ---
        // Build a frontend-shaped history for the AI service (excluding the brand-new user message)
        const historyForAI = chat.messages.slice(0, -1).map((m) => ({
            isAi: m.role === 'model',
            content: m.content,
        }));

        // Build the query: if an attachment was sent, add context about it
        const effectiveQuery = attachmentName
            ? `${content || 'Analyse this document.'} [User attached a file named: ${attachmentName}]`
            : content;

        console.log(`🤖 Calling Tavily + HuggingFace for chat ${chat._id}...`);
        const aiContent = await generateFinancialAdvice(historyForAI, effectiveQuery, req.user);

        const aiMessage = {
            role: 'model',
            content: aiContent,
            attachmentName: null,
            timestamp: new Date(),
        };
        chat.messages.push(aiMessage);

        await chat.save();

        // Return the two new messages so the frontend can append them
        const savedMessages = chat.messages.slice(-2);
        const formatMsg = (msg) => ({
            id: msg._id.toString(),
            isAi: msg.role === 'model',
            content: msg.content,
            attachmentName: msg.attachmentName || null,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        });

        res.status(201).json({
            chatId: chat._id.toString(),
            title: chat.title,
            userMessage: formatMsg(savedMessages[0]),
            aiMessage: formatMsg(savedMessages[1]),
        });
    } catch (error) {
        console.error('addMessage error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getChats, getChatById, createChat, renameChat, deleteChat, addMessage };
