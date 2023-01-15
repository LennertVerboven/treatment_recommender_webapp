import PropTypes from "prop-types";
import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {styles} from "../styles";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";


const PrescriptionListItem = (props) => {
    const {prescription, classes} = props;
    const presc = prescription;

    return (
        <ListItem className={classes.prescriptionListItem}>
            <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                <Grid container spacing={0}>
                    <Grid item xs={7}>{presc.drug_name}</Grid>
                    <Grid item xs={5}>{presc.dosage_in_mg}</Grid>
                </Grid>
            </ListItemText>
        </ListItem>
    );
};

PrescriptionListItem.propTypes = {
    prescription: PropTypes.object.isRequired,
    classes: PropTypes.object,
};

export default withStyles(styles)(PrescriptionListItem);
