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
  ExternalLink,
} from 'lucide-angular';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full h-16 md:h-full bg-surface-lowest border-t md:border-t-0 md:border-r border-soft',
  },
  templateUrl: './nav.component.html'
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
    {
      id: 'moe-portal',
      path: 'https://moe.gov.sa',
      labelKey: 'nav.moe-portal',
      icon: 'external-link',
      external: true,
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
      case 'external-link':
        return ExternalLink;
      default:
        return LayoutDashboard;
    }
  }
}
