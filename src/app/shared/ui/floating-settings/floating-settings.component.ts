import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, Settings, Moon, Sun, Languages, X } from 'lucide-angular';
import { Language, Theme } from '../../../core/models/user-preferences.model';

@Component({
  selector: 'app-floating-settings',
  standalone: true,
  imports: [CommonModule, TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixed bottom-20 ltr:right-4 rtl:left-4 z-[9999] md:bottom-6 sm:bottom-20',
  },
  template: `
    <div class="flex flex-col items-center gap-3">
      <!-- Expanded Menu (Slide Up) -->
      @if (isOpen()) {
        <div
          class="flex flex-col gap-3 animate-slide-up"
          role="menu"
          aria-label="Settings Menu"
        >
          <!-- Language Toggle -->
          <button
            class="ds-icon-btn shadow-ambient bg-surface-highest transition-transform hover:scale-110"
            [title]="'topbar.toggle-lang' | transloco"
            (click)="toggleLang.emit()"
            [attr.aria-label]="'topbar.toggle-lang' | transloco"
          >
            <lucide-icon [img]="LanguagesIcon" size="20"></lucide-icon>
          </button>

          <!-- Theme Toggle -->
          <button
            class="ds-icon-btn shadow-ambient bg-surface-highest transition-transform hover:scale-110"
            [title]="'topbar.toggle-theme' | transloco"
            (click)="toggleTheme.emit()"
            [attr.aria-label]="'topbar.toggle-theme' | transloco"
          >
            @if (currentTheme() === 'light') {
              <lucide-icon [img]="MoonIcon" size="20"></lucide-icon>
            } @else {
              <lucide-icon [img]="SunIcon" size="20"></lucide-icon>
            }
          </button>
        </div>
      }

      <!-- Main Trigger Button -->
      <button
        class="ds-icon-btn-active shadow-ambient transition-all duration-300 hover:scale-110"
        [class.rotate-45]="isOpen()"
        [attr.aria-expanded]="isOpen()"
        (click)="toggleOpen()"
        title="Settings"
      >
        <lucide-icon [img]="isOpen() ? CloseIcon : SettingsIcon" size="24"></lucide-icon>
      </button>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from {
        transform: translateY(1rem) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    .animate-slide-up {
      animation: slide-up 0.25s cubic-bezier(0.2, 0, 0, 1) forwards;
    }
  `]
})
export class FloatingSettingsComponent {
  public currentLang = input.required<Language>();
  public currentTheme = input.required<Theme>();

  public toggleLang = output<void>();
  public toggleTheme = output<void>();

  public isOpen = signal(false);

  // Icons
  protected readonly SettingsIcon = Settings;
  protected readonly CloseIcon = X;
  protected readonly MoonIcon = Moon;
  protected readonly SunIcon = Sun;
  protected readonly LanguagesIcon = Languages;

  public toggleOpen(): void {
    this.isOpen.update(v => !v);
  }
}
