import { Component } from '@angular/core';
import { ZardAccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { ZardAccordionComponent } from '@shared/components/accordion/accordion.component';

@Component({
  selector: 'cu-terms-of-service',
  imports: [ZardAccordionComponent, ZardAccordionItemComponent],
  templateUrl: './terms-of-service.html',
  styles: ``
})
export class TermsOfService {

}
