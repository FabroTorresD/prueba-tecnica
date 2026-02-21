import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class Profile {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop()
  birthDate?: Date;

   @Prop({ type: String, default: null })
  phone: string | null;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ enum: ['USER', 'ADMIN'], default: 'USER' })
  role: 'USER' | 'ADMIN';

  @Prop({ type: ProfileSchema, required: true })
  profile: Profile;

@Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);