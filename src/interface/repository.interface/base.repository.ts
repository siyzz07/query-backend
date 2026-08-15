export interface IBaseRepository<T> {
  create(item: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: object): Promise<T | null>;
  find(filter: object): Promise<T[]>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
