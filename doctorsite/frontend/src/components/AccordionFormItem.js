import React from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Accordion from "@material-ui/core/Accordion";
import withStyles from "@material-ui/core/styles/withStyles";
import {styles} from "../styles";
import Grid from "@material-ui/core/Grid";

const AccordionFormItem = (props) => {
    const {title, defaultExpanded, classes} = props;
    return (
        <Accordion className={classes.accordion} defaultExpanded={defaultExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography className={classes.detailFormItemTitle} variant="body2">{title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid item xs={12}>
                    {props.children}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

AccordionFormItem.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    defaultExpanded: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

export default withStyles(styles)(AccordionFormItem);