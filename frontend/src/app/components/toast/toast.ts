import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Toast, ToastService } from '../../_services/toast.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  copiedIds = new Set<string>();
  private readonly timeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private subscription!: Subscription;

  constructor(
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toast => {
      this.toasts = [...this.toasts, toast];
      
      // FORZA IL RENDER IMMEDIATO
      // Questo comunica ad Angular che deve ridisegnare questo componente ORA
      this.cdr.detectChanges(); 

      if (toast.autoDismiss !== false) {
        const timeout = setTimeout(() => {
          this.removeToast(toast.id);
          // Usiamo detectChanges() anche qui invece di markForCheck() 
          // per una rimozione immediata e sicura
          this.cdr.detectChanges(); 
        }, 2500);
        
        this.timeouts.set(toast.id, timeout);
      }
    });
  }

  removeToast(id: string) {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.copiedIds.delete(id);
  }

  copyToClipboard(text: string, toastId: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedIds = new Set([...this.copiedIds, toastId]);

      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.copiedIds.delete(toastId);
            this.copiedIds = new Set(this.copiedIds);
          });
        }, 2000);
      });
    }).catch(err => {
      console.error('Errore nella copia:', err);
    });
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}