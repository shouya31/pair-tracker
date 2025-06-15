export interface IRepository<T, ID> {
  save(entity: T): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  delete(id: ID): Promise<void>;
} 