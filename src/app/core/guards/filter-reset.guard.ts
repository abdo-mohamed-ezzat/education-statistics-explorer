import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { GlobalFilterService } from '../services/global-filter.service';

export const filterResetGuard: CanActivateFn = () => {
  const filterService = inject(GlobalFilterService);
  filterService.resetAll();
  return true;
};
