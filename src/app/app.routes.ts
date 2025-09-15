import { Routes } from '@angular/router';

import { ShellComponent } from './shell/shell.component';
import { SpellingComponent } from './features/spelling/spelling.component';
import { SpellingListsComponent, SpellingTestComponent } from './features/spelling/components';
import { SpellingPracticeComponent } from './features/spelling/components/spelling-practice/spelling-practice.component';

export const routes: Routes = [
	{
		path: '',
		component: ShellComponent,
		children: [
			// Add feature routes here
			{
				path: 'spelling',
				component: SpellingComponent,
				children: [
					{ path: 'lists', component: SpellingListsComponent },
					{ path: 'practice/:id', component: SpellingPracticeComponent },
					{ path: 'test/:id', component: SpellingTestComponent },
				],
			},
		],
	},
];
