import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UniqueIdService {
  private nextId = 0;

  generateId(prefix: string = 'id'): string {
    this.nextId++;
    return `${prefix}-${this.nextId}`;
  }
}
