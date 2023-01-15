import React, {Component} from "react";
import {List, ListItemText} from "@material-ui/core";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ExclusionListItem from "./ExclusionListItem";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import * as moment from "moment";
import Button from "@material-ui/core/Button";
import {PatientContext} from "../utils/PatientContext";


class ExclusionsFormItem extends Component {
    constructor(props) {
        super(props);
        this.exclusionType = props.exclusionType;
        this.state = {
            newExclusion: new this.exclusionType({
                drug_name: null,
                // reason: "",
                patient_id: props.patientId,
                date_issued: "",
            }),
        };
    }

    handleDelete = (id, e) => {
        this.props.onDelete(id);
    };

    handleAdd = (e) => {
        const {newExclusion} = this.state;
        this.props.onAdd(newExclusion);
        this.setState({
            newExclusion: new this.exclusionType({
                drug_name: null,
                // reason: "",
                patient_id: this.props.patientId,
                date_issued: "",
            })
        });
    };

    setNewDrugName = (e, newName) => {
        const {newExclusion} = this.state;
        const newNewExclusion = new this.exclusionType({
            ...newExclusion,
            drug_name: newName,
            date_issued: moment().utc(),
        });
        this.setState({
            newExclusion: newNewExclusion
        });
    };

    render() {
        const {newExclusion} = this.state;
        const {classes, exclusions, title} = this.props;
        const {drug_name} = newExclusion;
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
                />
            )
        };

        return (
            <List className={classes.prescriptionList}>
                <ListItem className={classes.prescriptionListItem}>

                    <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                        Drug name
                    </ListItemText>
                </ListItem>
                {exclusions && exclusions.length ?
                    <>
                        <Divider component="li"/>
                        {exclusions
                            .map(exclusion =>
                                <ExclusionListItem key={exclusion.id}
                                                   exclusion={exclusion}
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
                        <Grid container spacing={0}>
                            <Grid item xs={9}>
                                <Autocomplete options={drugs.map(d => d.drug_name)}
                                              size="small"
                                              renderInput={renderNewInput}
                                              onChange={this.setNewDrugName}
                                              value={newExclusion.drug_name}
                                              className={classes.exclusionAutoComplete}
                                              ListboxProps={{className: classes.exclusionAutoCompleteMenu}}

                                />
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

ExclusionsFormItem.propTypes = {
    classes: PropTypes.object.isRequired,
    exclusions: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    patientId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    exclusionType: PropTypes.any.isRequired,
};
ExclusionsFormItem.contextType = PatientContext;

export default withStyles(styles)(ExclusionsFormItem);