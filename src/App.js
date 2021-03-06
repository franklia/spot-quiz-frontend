import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './css/Styles.css';
import Home from './pages/Home';
import Test from './pages/Test';
import CreateQuestions from './pages/CreateQuestions';
import ManageQuestions from './pages/ManageQuestions';
import Notfound from './pages/Notfound';
import NavMenu from './ui-elements/NavMenu';
import EditQuestion from './pages/EditQuestion';
import ManageCategories from './pages/ManageCategories';
import Callback from './helpers/Callback';
import Auth from './helpers/Auth';
import history from './helpers/history';
// import Copyright from '@material-ui/icons/Copyright';

const theme = createMuiTheme({
  palette: {
    primary: {
      // light: calculated from palette.primary.main
      main: '#ff5c72', // main orange color eg. logo and buttons
      dark: '#f23f57', // darker orange for hover over buttons
      // contrastText: calculated to contrast with palette.primary.main
    },
    secondary: {
      light: '#fafcff', // background color of pages
      main: '#7d93b2', // paragraph text color
      dark: '#4c6280', // heading text color
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    background: {
      default: '#EFF6FF', // this is applied to the html <body> tag
    }
  },
  typography: {
    useNextVariants: true,
    fontFamily: [
      'Nunito',
      'sans-serif',
    ].join(','),
    fontWeight: 400,
    color: '#4c6280',
  },
});

const styles = theme => ({
  bodyBackground: {
    maxWidth: 1280,
    margin: 'auto',
    padding: 30,
    '@media (max-width: 1150px)': {
      padding: 10,
    },
  },
  footerContainer: {
    maxWidth: 1280,
    padding: '3px 40px 10px',
    color: '#fff',
    margin: 'auto',
    fontSize: 18,
    fontWeight: 800,
  },
  copyright: {
    position: 'relative',
    top: 6,
    marginRight: 10,
  }
});

// Auth0 
const auth = new Auth();

const handleAuthentication = ({location}) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication();
  }
}

class App extends Component {

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className='page-wrapper'>
        <MuiThemeProvider theme={theme}>
        <CssBaseline />
          <Router history={history} component={Home}>
            <div className={classes.bodyBackground}>
              <NavMenu auth={auth} />
              <div>
                <Switch>
                  <Route exact path="/" render={(props) => <Home auth={auth} {...props} />} />
                  <Route exact path="/test" render={(props) => <Test auth={auth} {...props} />} />
                  <Route exact path='/question/create' render={(props) => <CreateQuestions auth={auth} {...props} />} />
                  <Route exact path='/questions/index' render={(props) => <ManageQuestions auth={auth} {...props} />} />
                  <Route exact path='/question/:id' render={(props) => <EditQuestion auth={auth} {...props} />} />
                  <Route exact path='/callback' render={(props) => {
                    handleAuthentication(props);
                    return <Callback {...props} />
                  }}/>
                  <Route exact path="/categories" render={(props) => <ManageCategories auth={auth} {...props} />} />
                  <Route component={ Notfound } />
                </Switch>
              </div>
            </div>
          </Router>
        </MuiThemeProvider>
        </div>
        {/*
        <footer class='footer'>
          <div className={classes.footerContainer}>
            <Copyright className={classes.copyright} /><span>Frank Liardet</span>
          </div>
        </footer> */}
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(App);
