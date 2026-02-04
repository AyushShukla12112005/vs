import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['bug', 'feature', 'task'], default: 'bug' },
    status: { type: String, enum: ['open', 'in-progress', 'done'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

issueSchema.index({ project: 1, status: 1 });
issueSchema.index({ project: 1, title: 'text', description: 'text' });

export default mongoose.model('Issue', issueSchema);
