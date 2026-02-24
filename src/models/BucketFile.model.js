import mongoose from 'mongoose'

const bucketFileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
    },
    hostingerUrl: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mimetype: {
        type: String,
    },
    size: {
        type: Number,
    }
}, {
    timestamps: true
})

const BucketFile = mongoose.model('BucketFile', bucketFileSchema)

export default BucketFile
