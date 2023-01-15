
export const formatPdfReportURL = patientId => `/api/redcap/patients/${patientId}/report.pdf`;
export const formatConfirmChangesURL = patientId => `/api/redcap/patients/${patientId}/confirm_changes`;
export const formatPatientLink = patientId => `/app/patient/${patientId}/`;
export const formatPatientURL = patientId => `/api/redcap/patients/${patientId}/`;
export const formatPollRegimenChangesURL = patientId => `/api/redcap/patients/${patientId}/poll_regimen_computed`;
export const homeURL = `/app`;
export const drugsURL = `/api/redcap/drugs`;
export const patientsURL = `/api/redcap/patients`;
