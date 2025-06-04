import mongoose, { Schema, Document } from "mongoose";

export interface INoteContent extends Document {
  noteId: string;
  content: string;
  version: number;
}

const NoteContentSchema: Schema = new Schema(
  {
    noteId: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

export const NoteContent = mongoose.model<INoteContent>(
  "NoteContent",
  NoteContentSchema
);