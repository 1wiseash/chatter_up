import { Pipe, PipeTransform } from '@angular/core';
import { GameType } from '@models';

@Pipe({
  name: 'gameType'
})
export class GameTypePipe implements PipeTransform {

  transform(value: GameType): string {
    return GameType[value];
  }

}
