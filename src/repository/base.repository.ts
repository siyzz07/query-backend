import { Model, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interface/repository.interface/base.repository";

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(item: Partial<T>): Promise<T> {
    const created = await this.model.create(item);
    return created as T;
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: object): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async find(filter: object): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, item as UpdateQuery<T>, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
