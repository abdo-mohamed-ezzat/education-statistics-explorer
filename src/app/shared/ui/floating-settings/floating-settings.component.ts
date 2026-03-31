import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, Settings, Moon, Sun, Languages, X } from 'lucide-angular';
import { Language, Theme } from '../../../core/models/user-preferences.model';

@Component({
  selector: 'app-floating-settings',
  imports: [CommonModule, TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixed bottom-20 ltr:right-4 rtl:left-4 z-[9999] md:bottom-6 sm:bottom-20',
  },
  templateUrl: './floating-settings.component.html',
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
