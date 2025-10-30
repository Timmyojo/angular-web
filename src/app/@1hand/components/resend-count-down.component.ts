import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

@Component({
  selector: "app-resend-countdown",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="remainingTime > 0"
      class="inline text-sm text-blue-400 font-bold"
    >
      {{ remainingTime }}s
    </div>

    <ng-container *ngIf="remainingTime === 0">
      <a
        (click)="resend()"
        class="cursor-pointer text-[#1D9BED] hover:underline"
      >
        Resend
      </a>
    </ng-container>
  `,
})
export class ResendCountdownComponent implements OnInit {
  @Input() duration = 60; // seconds
  @Output() handleReset = new EventEmitter<void>();

  remainingTime = 0;
  private intervalId?: any;

  ngOnInit() {
    this.startCountdown();
  }

  startCountdown() {
    this.remainingTime = this.duration;
    this.intervalId = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  resend() {
    this.handleReset.emit();
  }
}
