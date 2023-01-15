import React, {Component} from "react";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import {PatientContext} from "../utils/PatientContext";
import ContraIndicationListItem from "./ContraIndicationListItem";
import {ContraIndication} from "../utils/Patient";
import * as moment from "moment";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";

class ContraIndicationsFormItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newIndication: new ContraIndication({
                drug_name: null,
                // reason: "",
                indication: "",
                patient_id: props.patientId,
                date_issued: "",
            }),
        };
    }

    handleDelete = (id, e) => {
        this.props.onDelete(id);
    };

    handleAdd = (e) => {
        const {newIndication} = this.state;
        const newNewIndication = new ContraIndication({
            ...newIndication,
            date_issued: moment().utc(),
        });
        this.props.onAdd(newNewIndication);
        this.setState({
            newIndication: new ContraIndication({
                drug_name: null,
                indication: "",
                // reason: "",
                patient_id: this.props.patientId,
                date_issued: "",
            })
        });
    };

    setNewDrugName = (e, newName) => {
        const {newIndication} = this.state;
        const newNewIndication = new ContraIndication({
            ...newIndication,
            drug_name: newName,
        });
        this.setState({
            newIndication: newNewIndication
        });
    };

    setNewIndication = (e) => {
        const {newIndication} = this.state;
        const newNewIndication = new ContraIndication({
            ...newIndication,
            indication: e.target.value,
        });
        this.setState({
            newIndication: newNewIndication
        });
    };

    render() {
        const {newIndication} = this.state;
        const {classes, indications} = this.props;
        const {drug_name} = newIndication;
        let drugs = this.context;

        const renderNewInput = (params) => {
            const {inputProps} = params;
            const newInputProps = {
                ...inputProps,
                className: inputProps.className + ' ' + classes.prescriptionListItemText,
            };
            return (
                <TextField {...params} margin="dense"
                           inputProps={newInputProps}
                           size="small"
                           placeholder="Pick a drug name"
                />
            )
        };

        return (
            // (indications && indications.length) ?
                <List className={classes.prescriptionList}>
                    <ListItem className={classes.prescriptionListItem}>

                        <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                            <Grid container spacing={0}>
                                <Grid item xs={8}><i>Drug name</i></Grid>
                                <Grid item xs={6}>Indication</Grid>
                            </Grid>
                        </ListItemText>
                    </ListItem>
                    {indications && indications.length ?
                        <>
                            <Divider component="li"/>
                            {indications
                                .map(indication =>
                                    <ContraIndicationListItem key={indication.id}
                                                              contraIndication={indication}
                                                              onDelete={this.handleDelete}
                                    />
                                )
                                .reduce((acc, x) => <>{acc}<Divider component="li"/>{x}</>)
                            }
                        </>
                        :
                        null
                    }
                    <Divider component="li"/>
                    <ListItem className={classes.prescriptionListItem}>

                        <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                            <Grid container alignItems="center" spacing={0}>
                                <Grid item xs={9}>
                                    <Grid container spacing={0}>
                                        <Grid item xs={12}>
                                            <Autocomplete options={drugs.map(d => d.drug_name)}
                                                          size="small"
                                                          renderInput={renderNewInput}
                                                          onChange={this.setNewDrugName}
                                                          value={newIndication.drug_name}
                                                          // className={classes.exclusionAutoComplete}
                                                          ListboxProps={{className: classes.exclusionAutoCompleteMenu}}

                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                InputProps={{ className: classes.detailTextField }}
                                                onChange={this.setNewIndication}
                                                value={newIndication.indication}
                                                placeholder="Enter a contra-indication"
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={3}>
                                    <Button disabled={!drug_name} className={classes.exclusionAddButton}
                                            variant="outlined" color="primary" onClick={this.handleAdd}>
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>

                        </ListItemText>

                    </ListItem>
                </List>
        );
    }
}

ContraIndicationsFormItem.propTypes = {
    classes: PropTypes.object.isRequired,
    indications: PropTypes.array.isRequired,
};
ContraIndicationsFormItem.contextType = PatientContext;

export default withStyles(styles)(ContraIndicationsFormItem);