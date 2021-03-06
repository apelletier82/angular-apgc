import { Component, Input } from '@angular/core';
import Address from '../../models/address';

@Component({
  selector: 'apgc-address-display',
  templateUrl: './address-display.component.html',
  styleUrls: ['./address-display.component.scss'],
})
export default class AddressDisplayComponent {
  @Input() address: Address;
}
