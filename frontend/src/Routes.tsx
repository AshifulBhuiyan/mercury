/* eslint react/jsx-props-no-spreading: off */
import React, { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { setToken, setUsername } from "./components/authSlice";
import { fetchVersion } from "./components/versionSlice";
import { getSessionId } from "./utils";
import { BrowserRouter as Router } from "react-router-dom";
import MainApp from "./views/App";
import AccountView from "./views/AccountView";
import HomeView from "./views/HomeView";
import LoginView from "./views/LoginView";
type Props = {
  children: ReactNode;
};

function App(props: Props) {
  const { children } = props;
  return <>{children}</>;
}

export default function Routes() {
  const dispatch = useDispatch();

  useEffect(() => {
    getSessionId();
    dispatch(fetchVersion());
    if (localStorage.getItem("token")) {
      dispatch(setToken(localStorage.getItem("token")));
    }
    if (localStorage.getItem("username")) {
      dispatch(setUsername(localStorage.getItem("username")));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <App>
        <Switch>
          <Route exact path="/" component={HomeView} />
          <Route
            exact
            path="/app/:slug/:embed?"
            component={MainApp}
          />
          <Route exact path="/login" component={LoginView} />
          <Route exact path="/account" component={AccountView} />
        </Switch>
      </App>
    </Router>
  );
}
