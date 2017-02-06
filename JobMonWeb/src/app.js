export class App {
	constructor() {
		this.status = 'ok';
	}

	configureRouter(config, router) {
		config.title = 'BizArk JobMon';
		config.map([
			{ route: '', redirect: 'dashboard' },
			{ route: 'dashboard', moduleId: 'dashboard/dashboard', nav: true, title: 'Dashboard', settings: { icon: 'dashboard' } },
			{ route: 'jobs', moduleId: 'jobs/jobs', nav: true, title: 'Jobs', settings: { icon: 'rocket' } },
			{ route: 'instances', moduleId: 'instances/instances', nav: true, title: 'Instances', settings: { icon: 'cog' } },
			{ route: 'agents', moduleId: 'agents/agents', nav: true, title: 'Agents', settings: { icon: 'server' } },
			{ route: 'settings', moduleId: 'settings/settings', nav: true, title: 'Settings', settings: { icon: 'wrench' } },
			{ route: 'help', moduleId: 'help/help', nav: true, title: 'Help', settings: { icon: 'help' } }
		]);
		this.router = router;
	}
}
