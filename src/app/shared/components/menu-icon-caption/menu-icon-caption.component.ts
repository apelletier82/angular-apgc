import { Component, Input } from '@angular/core';

@Component({
  selector: 'apgc-menu-icon-caption',
  templateUrl: './menu-icon-caption.component.html',
  styleUrls: ['./menu-icon-caption.component.scss'],
})
export default class MenuIconCaptionComponent {
  @Input() icon: string;

  @Input() iconFas: boolean;

  @Input() caption: string;
}
