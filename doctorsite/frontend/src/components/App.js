import React, {Component} from "react";
import {render} from "react-dom";
import PatientList from "./PatientList";
import PatientDetail from "./PatientDetail";
import {Route, Routes, BrowserRouter} from "react-router-dom";
import TopNavBar from "./TopNavBar";
import axiosSetup from "../utils/axiosUtils";
import {styles} from "../styles"
import Paper from "@material-ui/core/Paper";
import {withStyles} from "@material-ui/core";

class App extends Component {
    constructor(props) {
        super(props);
        axiosSetup()
    }

    render() {
        const { classes } = this.props;
        return (
            <BrowserRouter>
                <TopNavBar/>
                <Paper className={classes.paper}>
                    <Routes>
                        <Route exact path="/app/patient/:patientId" element={<PatientDetail />}/>
                        <Route path="/app" element={<PatientList />}/>
                    </Routes>
                </Paper>
            </BrowserRouter>
        );
    }
}

const StyledApp = withStyles(styles)(App);
export default StyledApp;

const container = document.getElementById("app");
render(<StyledApp/>, container);
