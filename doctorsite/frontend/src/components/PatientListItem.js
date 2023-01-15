import {Link as RouterLink} from 'react-router-dom';
import * as React from "react";
import ListItem from "@material-ui/core/ListItem";
import * as PropTypes from "prop-types";

function PatientListItem(props) {
    const {to} = props;

    const renderLink = React.useMemo(
        () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
        [to],
    );

    return (
        <ListItem button component={renderLink}>
            {props.children}
        </ListItem>
    );
}

PatientListItem.propTypes = {
    to: PropTypes.string.isRequired,
};

export default PatientListItem;