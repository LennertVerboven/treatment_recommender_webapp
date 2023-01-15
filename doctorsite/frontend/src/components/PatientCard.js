import Grid from "@material-ui/core/Grid";
import CardMedia from "@material-ui/core/CardMedia";
import PersonIcon from "@material-ui/icons/Person";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import TodayIcon from "@material-ui/icons/Today";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faClinicMedical,
    faUserMd,
    faVenusMars,
    faMicroscope,
    faQrcode
} from "@fortawesome/free-solid-svg-icons";
import CallIcon from "@material-ui/icons/Call";
import Card from "@material-ui/core/Card";
import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import {styles} from "../styles";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Accordion from "@material-ui/core/Accordion";

const OwnAccordionSummary = withStyles({
    root: {
        minHeight: 56,
        '&$expanded': {
            minHeight: 56,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
})(AccordionSummary);


const PatientCard = (props) => {
    const {classes, patient} = props;

    return (

        <Card className={classes.patientInfoCard}>

            <Accordion defaultExpanded className={classes.administrativeAccordion}>
                <OwnAccordionSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography className={classes.detailFormItemTitle} variant="body2">
                        {/*<Typography className={classes.cardTitle} color="textSecondary">*/}
                        Administrative info
                    </Typography>
                </OwnAccordionSummary>
                <AccordionDetails className={classes.administrativeAccordionDetails}>

                    <Grid container spacing={0} className={classes.cardGrid}>
                        <Grid item xs={4}>
                            <CardMedia className={classes.cardMedia}>
                                <PersonIcon className={classes.cardIcon} fontSize="large"/>
                            </CardMedia>
                        </Grid>
                        <Grid item xs={8}>
                            <CardContent className={classes.cardContent}>

                                <Typography className={classes.cardInfoText}
                                            color="textSecondary" variant="body2">
                                    <TodayIcon className={classes.cardInfoTextIcon}/>
                                    {`Born (y/m/d): ${patient.date_of_birth.format('YYYY/MM/DD')}`}
                                </Typography>
                                <Typography className={classes.cardInfoText}
                                            color="textSecondary" variant="body2">
                                    <FontAwesomeIcon icon={faVenusMars} className={classes.cardInfoTextIcon}/>
                                    {`Sex: ${patient.sex}`}
                                </Typography>
                                <Typography className={classes.cardInfoText}
                                            color="textSecondary" variant="body2">
                                    <CallIcon className={classes.cardInfoTextIcon}/>
                                    {`Phone: ${patient.phone_number}`}
                                </Typography>
                                <Typography className={classes.cardInfoText}
                                            color="textSecondary" variant="body2">
                                    <FontAwesomeIcon icon={faQrcode} className={classes.cardInfoTextIcon}/>
                                    {`Study ID: ${patient.study_id}`}
                                </Typography>
                                {/*<Typography className={classes.cardInfoText}*/}
                                {/*            color="textSecondary" variant="body2" >*/}
                                {/*    <FontAwesomeIcon icon={faUserMd} className={classes.cardInfoTextIcon} />*/}
                                {/*    {`Doctor: ${patient.assoc_doctors.map(doc => doc.full_name).join(', ')}`}*/}
                                {/*</Typography>*/}
                                <Typography className={classes.cardInfoText}
                                            color="textSecondary" variant="body2">
                                    <FontAwesomeIcon icon={faMicroscope} className={classes.cardInfoTextIcon}/>
                                    {`NIMDR: ${patient.nimdr}`}
                                    <br/>
                                    {`Phone: ${patient.nimdr_phone_number}`}
                                </Typography>
                                <Typography className={classes.cardInfoText}
                                            color="textSecondary" variant="body2">
                                    <FontAwesomeIcon icon={faClinicMedical} className={classes.cardInfoTextIcon}/>
                                    {`PCC: ${patient.pcc}`}
                                    <br/>
                                    {`Phone: ${patient.pcc_phone_number}`}
                                </Typography>
                                <Typography className={classes.cardInfoText}
                                            color="textSecondary" variant="body2">
                                    <FontAwesomeIcon icon={faUserMd} className={classes.cardInfoTextIcon}/>
                                    {`Intern: ${patient.intern}`}
                                    <br/>
                                    {`Phone: ${patient.intern_phone_number}`}
                                </Typography>
                            </CardContent>
                        </Grid>
                    </Grid>

                </AccordionDetails>
            </Accordion>
        </Card>

    );
};

PatientCard.propTypes = {
    classes: PropTypes.object.isRequired,
    patient: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);
