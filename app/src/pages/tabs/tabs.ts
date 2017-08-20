import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { PortfolioPage } from '../portfolio/portfolio';
import { TransactionsPage } from '../transactions/transactions';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = PortfolioPage;
  tab3Root = TransactionsPage;

  constructor() {

  }
}
