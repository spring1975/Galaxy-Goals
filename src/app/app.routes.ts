import { Routes } from '@angular/router';

import { ShellComponent } from './shell/shell.component';
import { SpellingComponent } from './features/spelling/spelling.component';
import { SpellingListsComponent, SpellingPracticeComponent, SpellingTestComponent } from './features/spelling/components';

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
