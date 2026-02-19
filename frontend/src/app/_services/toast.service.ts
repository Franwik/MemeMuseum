import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  autoDismiss?: boolean;
  copyText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  private readonly toastSubject = new ReplaySubject<Toast>(10);
  public toasts$ = this.toastSubject.asObservable();
  private idCounter = 0;

  show(type: Toast['type'], title: string, message: string, autoDismiss: boolean = true, copyText?: string) {
    const toast: Toast = {
      id: `toast-${Date.now()}-${this.idCounter++}`,
      type,
      title,
      message,
      autoDismiss,
      copyText
    };
    this.toastSubject.next(toast);
  }

  success(title: string, message: string, autoDismiss: boolean = true, copyText?: string) {
    this.show('success', title, message, autoDismiss, copyText);
  }

  error(title: string, message: string, autoDismiss: boolean = true, copyText?: string) {
    this.show('error', title, message, autoDismiss, copyText);
  }

  info(title: string, message: string, autoDismiss: boolean = true, copyText?: string) {
    this.show('info', title, message, autoDismiss, copyText);
  }

  warning(title: string, message: string, autoDismiss: boolean = true, copyText?: string) {
    this.show('warning', title, message, autoDismiss, copyText);
  }
}