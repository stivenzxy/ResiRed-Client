import { Component, OnInit } from '@angular/core';
import { FAQ } from './FAQs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-section.component.html',
  styleUrl: './help-section.component.css'
})
export class HelpSectionComponent implements OnInit {
  faqs = FAQ;

  constructor() { }

  ngOnInit(): void {
  }
}