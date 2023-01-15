import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles";
import Grid from "@material-ui/core/Grid";

function ConfirmChangesAlert(props) {
    const { classes, onClick } = props;
    return <Alert severity="warning" className={classes.submitAlert}>
        <Grid container spacing={0}>
            <Grid item>
                Do you agree to prescribe the new regimen?
            </Grid>
            <Grid container item spacing={0} justifyContent="flex-end">
                <Grid item>
                    <Button color="secondary" size="small" variant="outlined"
                            onClick={() => onClick(false)} className={classes.alertButton}
                    >
                        No
                    </Button>
                </Grid>
                <Grid item>
                    <Button color="primary" size="small" variant="outlined"
                            onClick={() => onClick(true)} className={classes.alertButton}
                    >
                        Yes
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    </Alert>;
}

ConfirmChangesAlert.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(ConfirmChangesAlert);
