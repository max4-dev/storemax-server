import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserModel = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    admin: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', UserModel);
