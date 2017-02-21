export class App {
	constructor() {
		this.status = 'ok';
	}

	configureRouter(config, router) {
		config.title = 'BizArk JobMon';
		config.map([
			{ route: '', redirect: 'dashboard' },
			{ route: 'dashboard', moduleId: 'pages/dashboard/dashboard', nav: true, title: 'Dashboard', settings: { icon: 'dashboard' } },
			{ route: 'jobs', moduleId: 'pages/jobs/jobs', nav: true, title: 'Jobs', settings: { icon: 'rocket' } },
			{ route: 'instances', moduleId: 'pages/instances/instances', nav: true, title: 'Instances', settings: { icon: 'cog' } },
			{ route: 'agents', moduleId: 'pages/agents/agents', nav: true, title: 'Agents', settings: { icon: 'server' } },
			{ route: 'settings', moduleId: 'pages/settings/settings', nav: true, title: 'Settings', settings: { icon: 'wrench' } }
		]);
		this.router = router;
	}
}
