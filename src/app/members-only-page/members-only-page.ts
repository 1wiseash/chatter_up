import { Component } from '@angular/core';
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cu-members-only-page',
  imports: [ZardButtonComponent, RouterLink],
  templateUrl: './members-only-page.html',
  styleUrl: './members-only-page.css'
})
export class MembersOnlyPage {

}
