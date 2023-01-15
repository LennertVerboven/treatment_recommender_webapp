import React from "react";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import {styles} from "../styles";

function Placeholder(props) {
    const { msg, classes } = props;
    return (
        <Typography className={classes.placeholder} variant="h5">{msg}</Typography>
    );
}

export default withStyles(styles)(Placeholder);