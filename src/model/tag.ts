import { getModelForClass, prop } from '@typegoose/typegoose';
import type { ModelType } from '@typegoose/typegoose/lib/types';

export class Tag {
	@prop({ required: true })
	name!: string;

	@prop({ required: true })
	content!: string;

	@prop({ required: true })
	authorId!: string;

	@prop({ required: true })
	lastEditorId!: string;

	@prop({ default: 0 })
	uses!: number;

	@prop({ default: [] })
	aliases!: string[];

	// These are automatically filled by Mongoose, they are just here for typings
	@prop({ required: false })
	createdAt!: Date;

	@prop({ required: false })
	updatedAt!: Date;

	static async findByName(this: ModelType<Tag>, name: string) {
		return await this.findOne({ name }).exec();
	}
}

export const TagModel = getModelForClass(Tag, {
	schemaOptions: { timestamps: true },
});
