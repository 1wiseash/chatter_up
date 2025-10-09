import { Pipe, PipeTransform } from '@angular/core';
import { MembershipType, SkillLevel } from '../models';

@Pipe({
  name: 'membershipLevel'
})
export class MembershipLevelPipe implements PipeTransform {

  transform(value: MembershipType): string {
    return MembershipType[value];
  }

}

@Pipe({
  name: 'pointsToNextSkillLevel'
})
export class PointsToNextSkillLevelPipe implements PipeTransform {

  transform(totalPoints: number): number {
        if (totalPoints < SkillLevel.Beginner) return SkillLevel.Beginner - totalPoints;
        if (totalPoints < SkillLevel.Intermediate) return SkillLevel.Intermediate - totalPoints;
        if (totalPoints < SkillLevel.Advanced) return SkillLevel.Advanced - totalPoints;
        if (totalPoints < SkillLevel.Expert) return SkillLevel.Expert - totalPoints;
        if (totalPoints < SkillLevel.Genius) return SkillLevel.Genius - totalPoints;
        return 0;
  }

}

@Pipe({
  name: 'percentageToNextSkillLevel'
})
export class PercentageToNextSkillLevel implements PipeTransform {

  transform(totalPoints: number): number {
      if (totalPoints === 0) return 0;
      if (totalPoints < SkillLevel.Beginner) return (totalPoints - SkillLevel.Novice)*100/(SkillLevel.Beginner - SkillLevel.Novice);
      if (totalPoints < SkillLevel.Intermediate) return (totalPoints - SkillLevel.Beginner)*100/(SkillLevel.Intermediate - SkillLevel.Beginner);
      if (totalPoints < SkillLevel.Advanced) return (totalPoints - SkillLevel.Intermediate)*100/(SkillLevel.Advanced - SkillLevel.Intermediate);
      if (totalPoints < SkillLevel.Expert) return (totalPoints - SkillLevel.Advanced)*100/(SkillLevel.Expert - SkillLevel.Advanced);
      if (totalPoints < SkillLevel.Genius) return (totalPoints - SkillLevel.Expert)*100/(SkillLevel.Genius - SkillLevel.Expert);
      return 100;
  }

}

@Pipe({
  name: 'currentSkillLevel'
})
export class CurrentSkillLevelPipe implements PipeTransform {

  transform(totalPoints: number): string {
      if (totalPoints < SkillLevel.Beginner) return SkillLevel[SkillLevel.Novice];
      if (totalPoints < SkillLevel.Intermediate) return SkillLevel[SkillLevel.Beginner];
      if (totalPoints < SkillLevel.Advanced) return SkillLevel[SkillLevel.Intermediate];
      if (totalPoints < SkillLevel.Expert) return SkillLevel[SkillLevel.Advanced];
      if (totalPoints < SkillLevel.Genius) return SkillLevel[SkillLevel.Expert];
      return SkillLevel[SkillLevel.Genius];
  }

}

@Pipe({
  name: 'nextSkillLevel'
})
export class NextSkillLevelPipe implements PipeTransform {

  transform(totalPoints: number): string {
        if (totalPoints < SkillLevel.Beginner) return SkillLevel[SkillLevel.Beginner];
        if (totalPoints < SkillLevel.Intermediate) return SkillLevel[SkillLevel.Intermediate];
        if (totalPoints < SkillLevel.Advanced) return SkillLevel[SkillLevel.Advanced];
        if (totalPoints < SkillLevel.Expert) return SkillLevel[SkillLevel.Expert];
        if (totalPoints < SkillLevel.Genius) return SkillLevel[SkillLevel.Genius];
        return SkillLevel[SkillLevel.Genius];
  }

}

