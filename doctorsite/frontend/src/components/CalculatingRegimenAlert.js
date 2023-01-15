import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import PropTypes from "prop-types";
import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import {styles} from "../styles";

function CalculatingRegimenAlert(props) {
    return <Alert severity="warning" className={props.classes.submitAlert}>
        <Grid container spacing={0}>
            <Grid item xs={8}>
                Calculating new regimen, please wait a moment...
            </Grid>
            <Grid item xs={4}>
                <CircularProgress color="inherit" size={30}
                                  className={props.classes.waitingProgress}
                />
            </Grid>
        </Grid>
    </Alert>;
}

CalculatingRegimenAlert.propTypes = {classes: PropTypes.object.isRequired};

export default withStyles(styles)(CalculatingRegimenAlert);
