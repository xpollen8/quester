# quester
Manage long-running cron or Q processing pipelines.

Ensures that only a single pipeline instance will run at a time.

# Install

```
npm i https://github.com/xpollen8/quester
```

# Usage

```
const quester = require('quester');

// your async process that consumes data
const doJob = async (data) => {
	return { processed: data }
}

// 
const job = new quester({
	interval: 1000,       // milliseconds between attempts to run
	iterations: 10,       // set if you want to terminate after this many runs
	name: 'demoJob',      // name of the job for logging
	func: () => doJob(jobData), // the async job that's run every interval
	after: (result) => {  // where the return of your job is reported
		console.log("RESULT", result);
	},
	logger: (msg) => {    // to receive quester interval progress updates
		console.log(msg);
	}
});

// example of use
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
```
