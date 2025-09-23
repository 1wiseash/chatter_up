import { Component } from '@angular/core';
import { ZardMenuModule } from '../components/menu/menu.module';
import { ZardButtonComponent } from '../components/button/button.component';
 
@Component({
  selector: 'cu-nav-menu',
  imports: [ZardMenuModule, ZardButtonComponent],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css'
})
export class NavMenu {
  settingsSelected() {
    console.log('settingsSelected method not implemented.');
  }
  aboutSelected() {
    console.log('aboutSelected method not implemented.');
  }
  practiceSelected() {
    console.log('practiceSelected method not implemented.');
  }
  watchSelected() {
    console.log('watchSelected method not implemented.');
  }
  
}
