import { Component } from '@angular/core';

import { PerformancePage } from '../performance/performance';
import { PortfolioPage } from '../portfolio/portfolio';
import { TransactionsPage } from '../transactions/transactions';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = PerformancePage;
  tab2Root = PortfolioPage;
  tab3Root = TransactionsPage;

  constructor() {

  }
}
