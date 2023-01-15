import PropTypes from "prop-types";
import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {styles} from "../styles";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";


const ContraIndicationListItem = (props) => {
    const {contraIndication, classes, onDelete} = props;

    return (
        <ListItem className={classes.prescriptionListItem}>
            <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                <Grid container spacing={0}>
                    <Grid item xs={8}>
                        <Typography variant="body2" style={{wordWrap: 'break-word'}}
                                    className={classes.prescriptionListItemText}>
                            <i>{contraIndication.drug_name}</i>
                        </ Typography>
                    </Grid>
                    <Grid item xs={8} zeroMinWidth>
                        <Typography variant="body2" style={{wordWrap: 'break-word'}}
                                    className={classes.prescriptionListItemText}>
                            {contraIndication.indication}
                        </ Typography>
                    </Grid>
                </Grid>
            </ListItemText>
            <ListItemSecondaryAction>
                <IconButton edge="end"
                            onClick={(e) => onDelete(contraIndication.id, e)}
                            className={classes.prescriptionListIcon}
                >
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

ContraIndicationListItem.propTypes = {
    contraIndication: PropTypes.object.isRequired,
    classes: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
};

export default withStyles(styles)(ContraIndicationListItem);
