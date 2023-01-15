import axios from "axios";
import React, {Component} from "react";
import Placeholder from "./Placeholder";
import {Link} from "react-router-dom";
import Alert from '@material-ui/lab/Alert';
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles"
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import DetailFormGridTextItem from "./DetailFormGridTextItem";
import SubmitAlert from "./SubmitChangesAlert";
import {Drug, DrugStockout, DrugToxicity, Patient} from "../utils/Patient";
import PrescriptionsFormItem from "./PrescriptionsFormItem";
import ExclusionsFormItem from "./ExclusionsFormItem";
import Fab from "@material-ui/core/Fab";
import SaveIcon from "@material-ui/icons/Save"
import CloudDownloadIcon from "@material-ui/icons/CloudDownload"
import ResistanceFormItem from "./ResistanceFormItem";
import cloneDeep from "lodash.clonedeep";
import isEqual from "lodash.isequal";
import {PatientContext} from "../utils/PatientContext";
import PropTypes from "prop-types";
import PatientCard from "./PatientCard";
import ContraIndicationsFormItem from "./ContraIndicationsFormItem";
import {
    drugsURL,
    formatConfirmChangesURL,
    formatPatientURL,
    formatPdfReportURL,
    formatPollRegimenChangesURL,
    homeURL
} from "../utils/urls";
import {poll} from "../utils/promises";
import AccordionFormItem from "./AccordionFormItem";
import ConfirmChangesAlert from "./ConfirmChangesAlert";
import CalculatingRegimenAlert from "./CalculatingRegimenAlert";
import {useParams} from "react-router-dom";

// error message if backend has not finished computing new regimen after 60 x 5sec = 5 minutes
const POLL_MAX_NB_RETRIES = 60;
const POLL_MS = 5000;


export const withRouter = (Component) => {
    const Wrapper = (props) => {
        const params = useParams();

        return (
            <Component
                params={params}
                {...props}
            />
        );
    };

    return Wrapper;
};

// todo loader wrapper component?
class PatientDetail extends Component {
    constructor(props) {
        super(props);
        let {patientId} = props.params;
        this.state = {
            patientId: patientId,
            patient: null,
            originalPatient: null,
            loading: true,
            placeholder: "",
            showSubmissionMsg: false,
            showSubmissionError: false,
            changed: false,
            weightSet: false,
            submissionErrorMsg: "",
            submissionMsg: "",
            receivedNewPrescriptions: false,
            drugs: [],
            confirmed: false,
            weight: "",
            waitingForRegimenResults: false,
        };
    }

    async componentDidMount() {
        try {
            await this.fetchPatient();
            await this.fetchDrugs();
        } catch (error) {
            console.error(`Fetching failed with error: ${error}`);
            this.setState({
                placeholder: "No WGS data available yet!",
                loading: false,
            });
        }
    }

    async fetchPatient() {
        const {patientId} = this.state;
        const response = await axios.get(`${formatPatientURL(patientId)}`);
        const patient = new Patient(response.data);
        this.setState({
            patient,
            originalPatient: cloneDeep(patient),
            loading: false
        });
        if (patient.last_requested_regimen.isAfter(patient.last_modified)) {
            this.retrieveAndSetRegimen();
        }
    }

    async fetchDrugs() {
        const response = await axios.get(`${drugsURL}`);
        const {data} = response;
        // caution: we assume all drugs are sent in one request
        const {results} = data;
        const drugs = results.map(d => new Drug(d));
        // console.log(drugs);
        this.setState({
            drugs,
        })
    }

    handleTextFieldChange = (event) => {
        const {name, value} = event.target;
        const patient = new Patient({
            ...this.state.patient,
            [name]: value,
        });
        this.setState({
            changed: true,
            patient
        });
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        const {weightSet} = this.state;
        if (!weightSet) {
            this.setState({
                showSubmissionError: true,
                submissionErrorMsg: 'Set a weight first!'
            });
            return;
        }
        try {
            console.debug("Submitting...");
            await this.submitPatient();
            this.setState({
                loading: false,
                showSubmissionMsg: true,
                submissionMsg: "Submission successful! Waiting for new regimen results...",
                changed: false,
            });
            // Retrieve regimen in separate request because algorithm might take a while to finish
            this.retrieveAndSetRegimen();
        } catch (error) {
            console.error(`Fetching failed with error: ${error}`);
            this.setState({
                showSubmissionError: true,
                loading: false,
                submissionErrorMsg: "Something went wrong...",
            });
        }
    };

    async submitPatient() {
        const {patientId, patient,} = this.state;
        this.setState({
            loading: true,
            placeholder: "Loading...",
        });
        const data = {
            ...patient,
            date_of_birth: patient.date_of_birth.format('YYYY-MM-DD')
        };
        const response = await axios.put(
            `${formatPatientURL(patientId)}`,
            data
        );
    }

    async retrieveAndSetRegimen() {
        const {patientId} = this.state;
        this.setState({
            waitingForRegimenResults: true,
        });
        try {
            const newPatient = await this.pollRegimenResultUntilReady(patientId);
            this.setNewPatient(newPatient);
            this.setState({
                waitingForRegimenResults: false,
                confirmed: false,
                showSubmissionMsg: true,
                submissionMsg: "Received new regimen results",
            });
        } catch (error) {
            console.error(`Fetching failed with error: ${error}`);
            this.setState({
                showSubmissionError: true,
                loading: false,
                submissionErrorMsg: "Something went wrong...",
            });
        }
    }

    async pollRegimenResultUntilReady(patientId) {
        const pollStatus = async () => (
            await axios.get(`${formatPollRegimenChangesURL(patientId)}`)
        );
        const checkStatus = response => response.data['ready'];
        const response = await poll(pollStatus, checkStatus, POLL_MS, POLL_MAX_NB_RETRIES);
        return response.data['patient']
    }


    setNewPatient(data) {
        const newPatient = new Patient(data);
        const originalPatient = this.state;
        const receivedNewPrescriptions = !isEqual(newPatient.prescriptions, originalPatient.prescriptions);
        this.setState({
            patient: newPatient,
            originalPatient: cloneDeep(newPatient),
            // changed: false,
            receivedNewPrescriptions: receivedNewPrescriptions,
        });
    }

    handleCloseSubmissionMsg = (e) => {
        this.setState({showSubmissionMsg: false});
    };

    handleCloseSubmissionError = (e) => {
        this.setState({showSubmissionError: false});
    };

    handleDeleteToxicity = (id) => {
        this.deleteExclusion(id, 'toxicities')
    };
    handleAddToxicity = (exclusion) => {
        this.addExclusion(exclusion, 'toxicities')
    };
    handleDeleteStockout = (id) => {
        this.deleteExclusion(id, 'stockouts')
    };
    handleAddStockout = (exclusion) => {
        this.addExclusion(exclusion, 'stockouts')
    };
    handleDeleteContraIndication = (id) => {
        this.deleteExclusion(id, 'contra_indications')
    };
    handleAddContraIndication = (exclusion) => {
        this.addExclusion(exclusion, 'contra_indications')
    };

    deleteExclusion = (id, exclusions_name) => {
        const {patient} = this.state;
        const exclusions = patient[exclusions_name];
        const index = exclusions.findIndex(e => e.id == id);
        if (index < 0) {
            return
        }
        exclusions.splice(index, 1);
        patient[exclusions_name] = exclusions;
        // const newPatient = {
        //     ...patient,
        //     exclusions_name: exclusions,
        // };
        this.setState({
            patient: patient,
            changed: true,
        });
    };

    addExclusion = (exclusion, exclusions_name) => {
        const {patient} = this.state;
        const exclusions = patient[exclusions_name];
        exclusions.push(exclusion);
        patient[exclusions_name] = exclusions;
        // const newPatient = {
        //     ...patient,
        //     exclusions_name: exclusions,
        // };
        this.setState({
            patient: patient,
            changed: true,
        });
    };

    handleWeightChange = (e) => {
        const newWeight = e.target.value;
        if (newWeight === "") {
            this.setState({
                weightSet: false,
                weight: "",
            });
            return
        }
        const {patient} = this.state;
        patient.weight_in_kg = e.target.value;
        // const newPatient = new Patient({
        //     ...patient,
        //     weight_in_kg: e.target.value,
        // });
        this.setState({
            patient: patient,
            changed: true,
            weightSet: true,
            weight: newWeight,
        });
    };

    resetPatient = (e) => {
        const {originalPatient} = this.state;
        this.setState({
            patient: cloneDeep(originalPatient),
            changed: false,
            weightSet: false,
            weight: "",
        });
    };

    handleConfirmSeenChanges = async (agreeOrNot) => {
        try {
            console.debug("Confirming...");
            const {patientId, patient} = this.state;
            this.setState({
                loading: true,
                placeholder: "Loading..."
            });
            const response = await axios.post(
                `${formatConfirmChangesURL(patientId)}`,
                {agreed: agreeOrNot},
            );
            const newDate = response.data;
            patient.last_confirmed = newDate;
            // const newPatient = new Patient({
            //     ...patient,
            //     last_confirmed: newDate,
            // });
            this.setState({
                patient: patient,
                originalPatient: cloneDeep(patient),
                loading: false,
                confirmed: true,
                showSubmissionMsg: true,
                submissionMsg: "Confirmation successful!",
            });
        } catch (error) {
            console.error(`Fetching failed with error: ${error}`);
            this.setState({
                showSubmissionError: true,
                loading: false,
                submissionErrorMsg: "Something went wrong while confirming...",
            });
        }
    };

    unconfirmedChanges = () => {
        const {patient} = this.state;
        return patient.last_modified.isAfter(patient.last_confirmed);
    };

    render() {
        const {
            loading, placeholder, patient, showSubmissionMsg, showSubmissionError, changed,
            submissionErrorMsg, receivedNewPrescriptions, drugs, confirmed, submissionMsg, weight,
            // waitingForRegimenResultsMsg,
            waitingForRegimenResults,
        } = this.state;
        const {classes} = this.props;
        const breadcrumbText = `Patient ${patient ? patient.study_id : "..."}`;
        const shouldConfirm = !!patient && (this.unconfirmedChanges() || (receivedNewPrescriptions && !confirmed));
        const prescriptionTitle = shouldConfirm ? "Revised" : "Current";
        return (
            <PatientContext.Provider value={drugs}>
                <Breadcrumbs>
                    {/* todo make button */}
                    <Link color="inherit" to={homeURL}>List</Link>
                    <Typography color="textPrimary">{breadcrumbText}</Typography>
                </Breadcrumbs>
                {!patient ?
                    <Placeholder msg={placeholder}/>
                    :
                    <>
                        <Typography variant="h1" className={classes.h1Title}>{patient.name}</Typography>
                        <Grid container spacing={2}>
                            <Grid item sm={6} xs={12}>
                                <PatientCard patient={patient}/>
                            </Grid>
                            {changed || shouldConfirm || waitingForRegimenResults ?
                                <Grid item sm={6} xs={12}>
                                    {changed ? <SubmitAlert changed={changed} onClick={this.resetPatient}/> : null}
                                    {shouldConfirm ?
                                        <ConfirmChangesAlert onClick={this.handleConfirmSeenChanges}/> : null
                                    }
                                    {waitingForRegimenResults ? <CalculatingRegimenAlert /> : null}
                                </Grid>
                                : null
                            }

                            <Grid item xs={12}>
                                <a href={formatPdfReportURL(patient.id)}
                                   target="_blank"
                                   className={classes.downloadAnchor}
                                >
                                    <Button color="primary" variant="outlined"
                                            className={classes.downloadButton} size="small"
                                    >
                                        <CloudDownloadIcon className={classes.extendedIcon}/>
                                        Download full report
                                    </Button>
                                </a>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={3} className={classes.detailGrid}>
                                    <DetailFormGridTextItem title="Weight (kg)" type="number"
                                                            onChange={this.handleWeightChange}
                                                            titleSizes={{sm: 2, xs: 5}}
                                                            fieldSizes={{sm: 4, xs: 7}}
                                                            value={weight}
                                    />
                                    <DetailFormGridTextItem value={patient.phone_number} title="Phone number"
                                                            name="phone_number"
                                                            titleSizes={{sm: 2, xs: 5}}
                                                            fieldSizes={{sm: 4, xs: 7}}
                                                            onChange={this.handleTextFieldChange}
                                    />
                                    <AccordionFormItem defaultExpanded title={`${prescriptionTitle} WGS Guided Regimen`}>
                                        <PrescriptionsFormItem prescriptions={patient.prescriptions}
                                                               receivedNewPrescriptions={receivedNewPrescriptions}
                                                               titleStart={prescriptionTitle}
                                        />
                                    </AccordionFormItem>
                                    <AccordionFormItem title="Contra-indications">
                                        <ContraIndicationsFormItem indications={patient.contra_indications}
                                                                   onDelete={this.handleDeleteContraIndication}
                                                                   onAdd={this.handleAddContraIndication}
                                                                   patientId={patient.id}
                                        />
                                    </AccordionFormItem>
                                    <AccordionFormItem title="Drug Toxicity">
                                        <ExclusionsFormItem exclusions={patient.toxicities}
                                                            onDelete={this.handleDeleteToxicity}
                                                            onAdd={this.handleAddToxicity}
                                                            patientId={patient.id}
                                                            title="Drug Toxicity"
                                                            exclusionType={DrugToxicity}
                                        />
                                    </AccordionFormItem>
                                    <AccordionFormItem title="Stockout">
                                        <ExclusionsFormItem exclusions={patient.stockouts}
                                                            onDelete={this.handleDeleteStockout}
                                                            onAdd={this.handleAddStockout}
                                                            patientId={patient.id}
                                                            title="Stockout"
                                                            exclusionType={DrugStockout}
                                        />
                                    </AccordionFormItem>
                                    <AccordionFormItem title="Susceptibility">
                                        <ResistanceFormItem resistant={patient.resistant}
                                                            susceptible={patient.susceptible}
                                        />
                                    </AccordionFormItem>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Snackbar open={showSubmissionMsg} autoHideDuration={5000}
                                  onClose={this.handleCloseSubmissionMsg}
                                  className={classes.snackbar}
                        >
                            <Alert onClose={this.handleCloseSubmissionMsg} severity="success">
                                {submissionMsg}
                            </Alert>
                        </Snackbar>
                        <Snackbar open={showSubmissionError} autoHideDuration={5000}
                                  onClose={this.handleCloseSubmissionError}
                                  className={classes.snackbar}
                        >
                            <Alert onClose={this.handleCloseSubmissionError} severity="error">
                                {submissionErrorMsg}
                            </Alert>
                        </Snackbar>
                    </>
                }
                <Backdrop className={classes.backdrop} open={loading}>
                    <CircularProgress color="inherit"/>
                </Backdrop>
                <div onClick={(e) => e.stopPropagation()}>
                    <Fab color="primary" variant="extended" className={classes.fabSubmit}
                         onClick={this.handleSubmit}
                    >
                        <SaveIcon className={classes.extendedIcon}/>
                        Compute regimen
                    </Fab>
                </div>
            </PatientContext.Provider>
        );
    }
}

PatientDetail.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(PatientDetail));
