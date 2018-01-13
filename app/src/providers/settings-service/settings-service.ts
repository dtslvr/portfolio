import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class SettingsServiceProvider {

  private subject = new BehaviorSubject<boolean>(false);
  private isRedactedMode: boolean;

  constructor() {
  }

  public getIsRedactedMode() {
    return this.subject.asObservable();
  }

  public toggleIsRedactedMode() {
    this.isRedactedMode = !this.isRedactedMode;
    this.subject.next(this.isRedactedMode);
  }

}
