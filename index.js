const perf = require('execution-time')();

module.exports = class Quester {
	constructor({ iterations = -1, interval = 1000, enabled = true, name = 'noName', func = async () => {}, logger = console.log, after = async () => {} }) {
		this.jobAfter = after;
		this.jobIterations = iterations;
		this.jobNumber = 0;
		this.jobsBlocked = 0;
		this.jobName = name;
		this.jobInterval = interval;
		this.jobFunc = func;
		this.jobLogger = logger;
		this.jobEnabled = enabled;
		this.jobIsRunning = false;
		this.timer;
	}

	done = async (result) => {
		this.jobIsRunning = false;
		this.jobsBlocked = 0;
		await this.jobAfter(result);
	}

	stop = () => {
		this.jobEnabled = false;
		this.jobIterations = this.jobNumber;
		clearInterval(this.timer);
		this.jobLogger(`${this.jobName} is now STOPPED`);
	}

	disable = () => {
		this.jobEnabled = false;
		this.jobLogger(`${this.jobName} is now DISABLED`);
	}

	enable = () => {
		this.jobEnabled = true;
		this.jobLogger(`${this.jobName} is now ENABLED`);
	}

	runJob = async () => {
		if (this.jobIterations > 0) {
			if (this.jobNumber > this.jobIterations) {
				clearInterval(this.timer);
				return;
			}
		}
		if (this.jobEnabled) {
			this.jobsBlocked++;
			if (!this.jobIsRunning) {
				this.jobIsRunning = true;
				perf.start(this.jobName);
				this.jobNumber++;
				this.jobLogger(`${this.jobName}: START JOB #${this.jobNumber}`);
				let result = {
					jobNumber: this.jobNumber,
					jobName: this.jobName,
					jobsBlocked: this.jobsBlocked - 1,
				};
				try {
					result = {
						...result,
						...await this.jobFunc(),
					};
				} catch (e) {
					this.jobLogger(`${this.jobName}: JOB #${this.jobNumber} ERROR: ${e.message || e.toString()}`);
				}
				const elapsed = perf.stop(this.jobName);
				result.jobRuntime = elapsed;
				this.jobLogger(`${this.jobName}: FINISH JOB #${this.jobNumber} - took ${elapsed.preciseWords}`, result);
				await this.done(result);
			} else {
				this.jobLogger(`${this.jobName}: AWAIT JOB #${this.jobNumber} (${(this.jobsBlocked - 1) * (this.jobInterval / 1000)} seconds so far..)`);
			}
		} else {
				this.jobLogger(`${this.jobName}: JOB #${this.jobNumber} - NOT ENABLED`);
		}
	}

	run = async () => {
		if (this.jobNumber === 0) {
			this.jobLogger(`${this.jobName} registered`);
		}
		// run first job NOW
		await this.runJob();
		// put the rest on a timer
		return this.timer = setInterval(this.runJob, this.jobInterval);
	}
}
