
export const styles = theme => ({
    searchTextField: {
        "& input::placeholder": {
            fontSize: "13px"
        }
    },
    detailTextField: {
        fontSize: 12,   // theme.typography.fontSize
    },
    detailFormItemTitle: {
        fontSize: 14,
        fontWeight: "bold",
    },
    h1Title: {
        fontSize: "2rem",
        margin: "0.5rem 0 1.2rem 0",
    },
    paper: {
        margin: "10px",
        padding: "20px",
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    placeholder: {
        margin: "3rem 0 0 0",
    },
    detailGrid: {
        alignItems: "center",
        marginBottom: "2rem",
    },
    prescriptionList: {
        padding: "0",
    },
    prescriptionListIcon: {
        minWidth: 32,
        color: theme.palette.error.light,
    },
    prescriptionListIconButton: {
        backgroundColor: theme.palette.action.disabled,
        display: "inline-block",
        borderRadius: "60px",
        padding: "0.2em 0.2em",
    },
    prescriptionListItemText: {
        fontSize: 12,
    },
    prescriptionListItem: {
        padding: "0.3rem 0 0.3rem 0",
    },
    exclusionListItem: {
        fontSize: 13,
    },
    submitAlert: {
        fontSize: 12,
        margin: "0 0 0.6rem 0",
    },
    extendedIcon: {
        marginRight: '4px',  // theme.spacing(1),
    },
    fabSubmit: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        "&:disabled": {
            backgroundColor: "rgba(232, 232, 232, 1)",
            color: "rgba(46, 49, 49, 1)",
        },
    },
    exclusionAutoComplete: {
        margin: "0 0.6rem 0 0",
    },
    exclusionAutoCompleteMenu: {
        fontSize: 12,
        padding: "0 0 0 0",
    },
    exclusionAddButton: {
        padding: '3px 20px',
        float: "right",
    },
    resistantListItemText: {
        fontSize: 12,
        // color: theme.palette.error.dark,
    },
    susceptibleListItemText: {
        fontSize: 12,
        color: theme.palette.success.dark,
    },
    resistantText: {

    },
    susceptibleText: {

    },
    resistantListItem: {
        padding: "0.3rem 0 0.3rem 1rem",
    },
    susceptibleListItem: {
        padding: "0.3rem 0 0.3rem 1rem",
    },
    allDataPanel: {
        width: "100%",
        margin: "1rem 0 3.5rem 0",
        backgroundColor: theme.palette.action.selected,
    },
    patientInfoCard: {
        backgroundColor: theme.palette.action.selected,
        width: "100%",
    },
    listButton: {
        textTransform: "none",
    },
    downloadButton: {
        textTransform: "none",
    },
    snackbar: {
        [theme.breakpoints.down('xs')]: {
            bottom: 80,
        },
    },
    downloadAnchor: {
        textDecoration: "inherit",
        color: "inherit",
        cursor: "auto",
        marginTop: "0.3rem",
    },
    cardTitle: {
        fontSize: 15,
    },
    cardMedia: {
        display: "flex",
        justifyContent: "center",
    },
    cardIcon: {
        fontSize: "100px",
        color: theme.palette.text.secondary,
    },
    cardGrid: {
        alignItems: "center",
    },
    cardContent: {
        padding: 0,
        "&:last-child": {
            paddingBottom: "0.8rem",
        },
    },
    cardInfoText: {
        alignItems: "center",
        fontSize: 13,
        display: "flex",
        marginBottom: "0.25rem",
    },
    cardInfoTextIcon: {
        paddingRight: "0.5rem",
        fontSize: "18px",
        minWidth: "28px",
    },
    waitingProgress: {
        float: "right",
    },
    accordion: {
        width: '100%',
        // margin: "8px 0",
        "&.Mui-expanded": {
            margin: "8px 0",
        },
    },
    administrativeAccordion: {
        width: '100%',
        backgroundColor: "rgba(0, 0, 0, 0.0)",
    },
    administrativeAccordionDetails: {
        paddingTop: 0,
    },
    alertButton: {
        margin: '10px 5px 0 5px',
    },
});
