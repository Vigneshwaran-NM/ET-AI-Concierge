const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    attachmentName: {
        type: String,
        default: null,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            default: 'New Consultation',
            trim: true,
        },
        messages: [messageSchema],
    },
    { timestamps: true } // adds createdAt & updatedAt automatically
);

module.exports = mongoose.model('Chat', chatSchema);
