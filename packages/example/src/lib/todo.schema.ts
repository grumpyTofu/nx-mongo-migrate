import mongoose from 'mongoose';
const { Schema } = mongoose;

interface ITodo {
  title: string;
  value: string;
}

export const TodoSchema = new Schema<ITodo>({
  title: { type: String, required: true },
  value: { type: String, required: true },
});

export const TodoCollection = 'todos';
export const Todo = mongoose.model<ITodo>(TodoCollection, TodoSchema);

/* If you are using NestJS, there is a better way to do this below:

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

@Schema({ collection: 'todos' })
export class Todo {
  @Prop({
    required: [true, 'title is required'],
  })
  title: string;

  @Prop({
    required: [true, 'Please add your task to complete'],
  })
  value: string;
}

export type TodoDocument = HydratedDocument<Todo>;
export const TodoSchema = SchemaFactory.createForClass(Todo);
*/

/*
With the class based schema, you can instantiate your model in your migration scripts like so:

const Todos = mongoose.model(Todo.name, TodoSchema);
*/
