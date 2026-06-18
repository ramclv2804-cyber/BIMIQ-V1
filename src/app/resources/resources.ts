import { Component } from '@angular/core';
import { AppHeader } from '../app-header/app-header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resources',
  imports: [AppHeader,CommonModule],
  templateUrl: './resources.html',
  styleUrl: './resources.css',
})
export class Resources {

}
