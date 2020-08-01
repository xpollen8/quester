const quester = require('./index');

const jobData = [
	{ hello: 'world1' },
	{ hello: 'world2' },
	{ hello: 'world3' },
	{ hello: 'world4' },
];

const doJob = async (data) => {
	return { processed: data }
}

const job = new quester({
	interval: 1000,
	iterations: 10,
	name: 'demoJob',
	func: () => doJob(jobData),
	after: (result) => {
		console.log("RESULT", result);
	},
	logger: (msg) => {
		console.log(msg);
	}
});

(async () => {
	// will run initially
	job.run();
	// after 2 second, disable the job
	setTimeout(() => { job.disable() }, 2000);
	// after 4 second, re-enable the job
	setTimeout(() => { job.enable() }, 4000);
	// stop the job after 6 seconds
	setTimeout(() => { job.stop() }, 6000);
})();
