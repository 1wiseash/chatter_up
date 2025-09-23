import { Component } from '@angular/core';
import { NavMenu } from '../nav-menu/nav-menu';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cu-header',
  imports: [NavMenu, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  signIn() {
    console.log('signIn method not implemented.');
  }

}
