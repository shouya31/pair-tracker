export abstract class Entity {
  constructor(private readonly id: string) {}

  getId(): string {
    return this.id;
  }

  equals(other: Entity): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    return this.id === other.id;
  }
} 