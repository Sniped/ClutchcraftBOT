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

	static async findByNameOrAlias(this: ModelType<Tag>, query: string) {
		const nameQuery = await TagModel.findByName(query);
		if (nameQuery) return { type: TagQueryType.Name, result: nameQuery };
		const aliasQuery = await TagModel.findByAlias(query);
		if (aliasQuery) return { type: TagQueryType.Alias, result: aliasQuery };
		return null;
	}

	static async findByAlias(this: ModelType<Tag>, alias: string) {
		return await this.findOne({ aliases: alias }).exec();
	}
}

export enum TagQueryType {
	Name,
	Alias,
}

export const TagModel = getModelForClass(Tag, {
	schemaOptions: { timestamps: true },
});
