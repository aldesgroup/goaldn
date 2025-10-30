// this structure serves both for containing the report functions,
// and helping define a type for the args passed to the init function
const reporter = {
    reportErrorFn: (error: unknown) => {}, // we can't console.log by default because of production!
    reportWarningFn: (warning: unknown) => {}, // we can't console.log by default because of production!
};
type reporterType = typeof reporter;

// should be called in the init part of an app
export const initReporting = (reporterConfig: reporterType) => {
    reporter.reportErrorFn = reporterConfig.reportErrorFn;
    reporter.reportWarningFn = reporterConfig.reportWarningFn;
    Object.freeze(reporter);
};

// utilities to be called to get the report functions
export const getReportError = () => reporter.reportErrorFn;
export const getReportWarning = () => reporter.reportWarningFn;
