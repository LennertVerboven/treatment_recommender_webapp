import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";
import Placeholder from "./Placeholder";
import {List, ListItemText} from "@material-ui/core";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import PersonIcon from '@material-ui/icons/Person';
import SearchIcon from '@material-ui/icons/Search';
import PatientListItem from "./PatientListItem";
import Typography from "@material-ui/core/Typography";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import {PatientForList, patientForListMatchesQuery} from "../utils/Patient";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import {formatPatientLink, patientsURL} from "../utils/urls";


class PatientList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            patients: [],
            filteredPatients: [],
            loading: true,
            placeholder: "Loading...",
            nextUrl: "",
            showFetchError: false,
            query: "",
        };
        this.debouncedFilterPatients = AwesomeDebouncePromise(
            this.filterPatients,
            500,
        );
    }

    async componentDidMount() {
        try {
            const response = await axios.get(`${patientsURL}`);
            const {data} = response;
            const {results, next} = data;
            // console.log(results.map(p => new PatientForList(p)));
            const patients = results.map(p => new PatientForList(p));
            this.setState({
                patients,
                filteredPatients: patients,
                loading: false,
                placeholder: "No patients found...",
                nextUrl: next,
            });
        } catch (error) {
            console.error(`Fetching failed with error: ${error}`);
            this.setState({
                placeholder: "Something went wrong!",
                loading: false,
            });
        }
    }

    handleCloseFetchError = (e) => {
        this.setState({showFetchError: false});
    };

    handleQueryChange = async (e) => {
        const query = e.target.value;
        this.setState({query});
        const filteredPatients = await this.debouncedFilterPatients(query);
        this.setState({filteredPatients});
    };

    filterPatients = (query) => {
        const {patients} = this.state;
        return patients.filter(
            p => patientForListMatchesQuery(p, query)
        );
    };

    handleFilterClick = (e) => {
        const {query} = this.state;
        const filteredPatients = this.filterPatients(query);
        this.setState({filteredPatients});
    };

    loadMorePatients = async () => {
        try {
            const {nextUrl, patients} = this.state;
            const response = await axios.get(nextUrl);
            const {data} = response;
            const {results, next} = data;
            const newPatients = results.map(p => new PatientForList(p));
            const extendedPatients = patients.concat(newPatients);
            this.setState({
                patients: extendedPatients,
                loading: false,
                placeholder: "No patients found...",
                nextUrl: next,
            });
        } catch (error) {
            console.error(`Fetching failed with error: ${error}`);
            this.setState({
                placeholder: "Something went wrong!",
                loading: false,
                showFetchError: true,
            });
        }
    };

    render() {
        // todo use active or not in list
        const {placeholder, loading, showFetchError, query, filteredPatients, nextUrl} = this.state;
        const {classes} = this.props;
        return (
            <>
                <Typography variant="h1" className={classes.h1Title}>List of patients</Typography>

                <Grid container spacing={1}>
                    <Grid item xs={8}>
                        <TextField value={query} onChange={this.handleQueryChange} fullWidth
                                   placeholder="Search by name, phone, hospital"
                                   classes={{ root: classes.searchTextField }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant="outlined" color="primary" size="small"
                                onClick={this.handleFilterClick} className={classes.listButton}
                                // onClick={this.fetchWithQuery} className={classes.listButton}
                                startIcon={<SearchIcon />}
                                // disabled={!query}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
                {!filteredPatients.length ?
                    <Placeholder msg={placeholder}/>
                    :
                    <List>
                        {filteredPatients.map(patient => {
                            return (
                                <PatientListItem key={patient.id} value={patient.id}
                                                 to={!patient.disabled ? `${formatPatientLink(patient.id)}` : "#"}
                                >
                                    <ListItemAvatar>
                                        <Avatar><PersonIcon/></Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={patient.name}
                                        secondary={`${patient.date_of_birth.format('YYYY-MM-DD')} - ${patient.sex}`}
                                    />
                                </PatientListItem>
                            );
                        })}
                    </List>
                }
                <Snackbar open={showFetchError} autoHideDuration={3000}
                          onClose={this.handleCloseFetchError}>
                    <Alert onClose={this.handleCloseFetchError} severity="error">
                        Something went wrong...
                    </Alert>
                </Snackbar>
                {nextUrl ?
                    <Button variant="contained" color="primary"
                            className={classes.listButton}
                            onClick={this.loadMorePatients}
                    >
                        Load more...
                    </Button>
                    : null
                }
                <Backdrop className={classes.backdrop} open={loading}>
                    <CircularProgress color="inherit"/>
                </Backdrop>
            </>
        );
    }
}

PatientList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientList);