import PropTypes from "prop-types";
import React from "react";
import ListItem from "@material-ui/core/ListItem";
import {ListItemText} from "@material-ui/core";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import {styles} from "../styles";
import withStyles from "@material-ui/core/styles/withStyles";


const ExclusionListItem = (props) => {
    const {exclusion, classes, onDelete} = props;

    return (
        <ListItem className={classes.prescriptionListItem}>
            {/*<ListItemIcon className={classes.prescriptionListIcon}>*/}
            {/*    <NotInterestedIcon/>*/}
            {/*</ListItemIcon>*/}
            <ListItemText classes={{primary: classes.prescriptionListItemText}}>
                {exclusion.drug_name}
                {/*<Grid container spacing={0}>*/}
                {/*    <Grid item xs={5}>{exclusion.drug_name}</Grid>*/}
                {/*    <Grid item xs={7}>{exclusion.reason}</Grid>*/}
                {/*</Grid>*/}
            </ListItemText>
            <ListItemSecondaryAction>
                <IconButton edge="end"
                            onClick={(e) => onDelete(exclusion.id, e)}
                            className={classes.prescriptionListIcon}
                >
                    {/*<ListItemAvatar><Avatar><DeleteIcon/></Avatar></ListItemAvatar>*/}
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

ExclusionListItem.propTypes = {
    exclusion: PropTypes.object.isRequired,
    classes: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
};

export default withStyles(styles)(ExclusionListItem);