import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'cu-progress-bar',
  imports: [NgStyle],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css'
})
export class ProgressBar {
  @Input() percentage: number = 0;
  @Input() height: number = 8;
}
