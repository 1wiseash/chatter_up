import { Component } from '@angular/core';
import { ZardAccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { ZardAccordionComponent } from '@shared/components/accordion/accordion.component';

@Component({
  selector: 'cu-privacy',
  imports: [ZardAccordionComponent, ZardAccordionItemComponent],
  templateUrl: './privacy.html',
  styles: ``
})
export class Privacy {

}
