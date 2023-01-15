import React, {Component} from "react";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles";
import PrescriptionListItem from "./PrescriptionListItem";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";

class PrescriptionsFormItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes, prescriptions} = this.props;
        return (
            prescriptions && prescriptions.length ?
                <List className={classes.prescriptionList}>
                    <ListItem className={classes.prescriptionListItem}>
                        <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                            <Grid container spacing={0}>
                                <Grid item xs={7}><i>Drug name</i></Grid>
                                <Grid item xs={5}><i>Dosage</i></Grid>
                            </Grid>
                        </ListItemText>
                    </ListItem>
                    <Divider component="li"/>
                    {prescriptions
                        .map(prescription =>
                            <PrescriptionListItem key={prescription.id}
                                                  prescription={prescription}
                            />
                        )
                        .reduce((acc, x) =>
                            <>
                                {acc}
                                <Divider component="li"/>
                                {x}
                            </>
                        )}
                </List>
                :
                <Typography className={classes.prescriptionListItemText} variant="body2">
                    No prescriptions yet.
                </Typography>

        );
    }
}

PrescriptionsFormItem.propTypes = {
    classes: PropTypes.object.isRequired,
    prescriptions: PropTypes.array.isRequired,
};

export default withStyles(styles)(PrescriptionsFormItem);