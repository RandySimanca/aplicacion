// backend/models/UnlockCode.js
import mongoose from "mongoose";

const unlockCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    isMaster: { type: Boolean, default: false },
    usageLimit: { type: Number, default: 0 }, // 0 = ilimitado
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("UnlockCode", unlockCodeSchema);

