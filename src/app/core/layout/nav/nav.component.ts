import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
  LucideAngularModule,
  LayoutDashboard,
  LineChart,
  Map,
  Users,
  Layers,
  TrendingUp,
} from 'lucide-angular';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full h-16 md:h-full bg-surface-lowest border-t md:border-t-0 md:border-r border-soft',
  },
  template: `
    <nav
      class="flex md:flex-col h-full w-full justify-around md:justify-start overflow-y-auto px-2 py-2 md:py-6 gap-2"
      aria-label="Main Navigation"
    >
      @for (item of navItems; track item.id) {
        <a
          [routerLink]="item.path"
          routerLinkActive="bg-primary text-white shadow-soft font-medium drop-shadow-sm [&>span]:text-white [&>lucide-icon]:text-white pointer-events-none"
          [routerLinkActiveOptions]="{ exact: false }"
          class="flex flex-col flex-1 md:flex-none justify-center items-center gap-[0.25rem] px-[0.25rem] py-[0.5rem] md:py-[0.75rem] rounded-xl text-muted hover:text-main hover:bg-surface-low transition-all group overflow-hidden"
        >
          <lucide-icon
            [img]="getIcon(item.icon)"
            size="22"
            strokeWidth="1.5"
            class="flex-none transition-colors group-hover:text-primary"
          ></lucide-icon>
          <span class="w-full text-center text-[0.625rem] md:text-[0.75rem] font-body truncate transition-colors px-[0.125rem]">
            {{ item.labelKey | transloco }}
          </span>
        </a>
      }
    </nav>
  `,
})
export class NavComponent {
  public navItems: NavItem[] = [
    { id: 'overview', path: '/overview', labelKey: 'nav.overview', icon: 'dashboard' },
    { id: 'trends', path: '/trends', labelKey: 'nav.trends', icon: 'line-chart' },
    {
      id: 'regional-analysis',
      path: '/regional-analysis',
      labelKey: 'nav.regional-analysis',
      icon: 'map',
    },
  ];

  public getIcon(name: string): any {
    switch (name) {
      case 'dashboard':
        return LayoutDashboard;
      case 'line-chart':
        return TrendingUp;
      case 'map':
        return Map;
      case 'users':
        return Users;
      case 'layers':
        return Layers;
      default:
        return LayoutDashboard;
    }
  }
}
