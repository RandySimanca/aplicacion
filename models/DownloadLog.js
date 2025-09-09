// backend/models/DownloadLog.js
import mongoose from "mongoose";

const downloadLogSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", index: true },
    ip: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true },
    reason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("DownloadLog", downloadLogSchema);

