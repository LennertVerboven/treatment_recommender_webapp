import React from "react";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import {styles} from "../styles";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";

const ResistanceFormItem = (props) => {
    const {classes, resistant, susceptible} = props;
    return (
        <>
            <Typography className={classes.prescriptionListItemText} variant="body2">
                <i><span className={classes.resistantListItemText}>Resistant-</span>
                    <span className={classes.susceptibleListItemText}>-susceptible</span></i>
            </Typography>
            <List className={classes.prescriptionList}>
                <ListItem className={classes.prescriptionListItem}>
                    <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                        <Grid container spacing={0}>
                            <Grid item xs={6}><i>Drug name</i></Grid>
                            <Grid item xs={6}><i>Resistant gene</i></Grid>
                        </Grid>
                    </ListItemText>
                </ListItem>
                <Divider component="li"/>
                {resistant && resistant.length ?
                    <>
                        {resistant
                            .map(res =>
                                <ListItem className={classes.resistantListItem}>
                                    <ListItemText classes={{primary: classes.resistantListItemText}}>
                                        <Grid container spacing={0}>
                                            <Grid item xs={6}>{res.drug}</Grid>
                                            <Grid item xs={6}>{res.gene}</Grid>
                                        </Grid>
                                    </ListItemText>
                                </ListItem>
                            )
                            .reduce((acc, x) =>
                                <>
                                    {acc}
                                    <Divider component="li"/>
                                    {x}
                                </>
                            )}
                    </>
                    :
                    <Typography className={classes.prescriptionListItemText} variant="body2">
                        No resistances yet
                    </Typography>
                }
                <Divider component="li"/>
                {/*</List>*/}
                {/*<List className={classes.prescriptionList}>*/}
                {susceptible && susceptible.length ?
                    <>

                        {susceptible
                            .map(sus =>
                                <ListItem className={classes.susceptibleListItem}>
                                    <ListItemText classes={{primary: classes.susceptibleListItemText}}>
                                        <Grid container spacing={0}>
                                            <Grid item xs={6}>{sus.drug}</Grid>
                                            <Grid item xs={6}>{sus.gene}</Grid>
                                        </Grid>
                                    </ListItemText>
                                </ListItem>
                            )
                            .reduce((acc, x) =>
                                <>
                                    {acc}
                                    <Divider component="li"/>
                                    {x}
                                </>
                            )}
                    </>
                    :
                    <Typography className={classes.prescriptionListItemText} variant="body2">
                        No susceptibilities yet
                    </Typography>
                }
            </List>
        </>
    );
};

ResistanceFormItem.propTypes = {
    classes: PropTypes.object.isRequired,
    resistant: PropTypes.array,
    susceptible: PropTypes.array,
};

export default withStyles(styles)(ResistanceFormItem);