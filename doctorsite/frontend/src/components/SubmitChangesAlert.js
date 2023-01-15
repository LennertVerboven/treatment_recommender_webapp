import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import PropTypes from "prop-types";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles";
import Grid from "@material-ui/core/Grid";

function SubmitChangesAlert(props) {
    return <>
        <Alert severity="warning" className={props.classes.submitAlert}>
            <Grid container spacing={0}>
                <Grid item>
                    Submit for your changes to take effect!
                </Grid>
                <Grid container item spacing={0} justifyContent="flex-end">
                    <Grid item>
                        <Button disabled={!props.changed} className={props.classes.alertButton}
                                color="secondary" onClick={props.onClick} size="small"
                                variant="outlined"
                        >
                            <RotateLeftIcon className={props.classes.extendedIcon}/>
                            Undo
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Alert>
    </>;
}

SubmitChangesAlert.propTypes = {
    classes: PropTypes.object.isRequired,
    changed: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(SubmitChangesAlert);
