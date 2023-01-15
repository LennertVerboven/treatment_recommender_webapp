import React from "react";
import PropTypes from 'prop-types';
import TextField from "@material-ui/core/TextField";
import withStyles from "@material-ui/core/styles/withStyles";
import {styles} from "../styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const DetailFormGridTextItem = (props) => {
    const { title, readOnly, classes, titleSizes, fieldSizes, ...restProps } = props;
    const titleSz = titleSizes ? titleSizes : {sm: 2, xs: 4};
    const fieldSz = fieldSizes ? fieldSizes : {sm: 10, xs: 8};
    return (
        <>
            <Grid item {...titleSz} >
                <Typography className={classes.detailFormItemTitle} variant="body2">{title}</Typography>
            </Grid>
            <Grid item {...fieldSz} >
                <TextField InputProps={{ className: classes.detailTextField, readOnly: !!readOnly }}
                           {...restProps}
                />
            </Grid>
        </>
    );
};

DetailFormGridTextItem.propTypes = {
    title: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    titleSizes: PropTypes.object,
    fieldSizes: PropTypes.object,
};

export default withStyles(styles)(DetailFormGridTextItem);