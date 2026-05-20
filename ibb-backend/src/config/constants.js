exports.ANALYSIS_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
};

exports.REPORT_STATUS = {
  PENDING: 'PENDING',
  GENERATING: 'GENERATING',
  READY: 'READY',
  FAILED: 'FAILED',
};

exports.EVENTS = {
  ANALYSIS_PROGRESS: 'analysis:progress',
  ANALYSIS_DONE:     'analysis:done',
  ANALYSIS_FAILED:   'analysis:failed',
  NOTIFICATION:      'notification',
  REPORT_READY:      'report:ready',
};
