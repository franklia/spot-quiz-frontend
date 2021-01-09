import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ConfirmUserCredentials from '../helpers/ConfirmUserCredentials.js';
import { Grid, Button } from '@material-ui/core';

const styles = (theme) => ({
  container: {
    textAlign: 'center',
  },
  heading: {
    fontSize: 35,
    margin: '40px 0',
  },
  subText: {
    fontSize: 18,
    lineHeight: '45px',
    marginBottom: 50,
    maxWidth: 800,
    margin: 'auto',
  },
  instructionsContainer: {
    marginBottom: 20,
    textAlign: 'left',
  },
  instructionsNumbers: {
    borderRadius: '50%',
    border: '1px solid',
    // height: 25,
    width: 25,
    display: 'inline-block',
    margin: '0 20px 0 0',
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 18,
  },
  buttonRow: {
    margin: '30px 0 0 -10px',
  },
  ctaMinorButton: {
    border: '1px solid #ceddf2',
    backgroundColor: '#EFF6FF',
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: 18,
    display: 'inline-flex',
    color: '#7d93b2',
    textTransform: 'capitalize',
    borderRadius: '8px',
    boxShadow: 'none',
    padding: '7px 40px',
    '&:hover': {
      backgroundColor: '#9eb4d2',
      borderColor: '#9eb4d2',
      color: '#fff',
    },
  },
});

class Home extends Component {
  componentDidMount = () => {
    const { auth } = this.props;
    ConfirmUserCredentials(auth, this.setAuth0Id, () => {});
  };

  setAuth0Id = (id) => {
    this.setState({ auth0_id: id });
  };

  login = () => {
    this.props.auth.login();
  };

  logout = () => {
    this.props.auth.logout();
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <h1 className={classes.heading}>
          Skills are learned via <span className='word-highlight'>repetition</span>
        </h1>
        <p className={classes.subText}>
          Becoming an expert in your field takes time and dedication. Spot Quiz was created to help improve the author's
          coding skills, but you can use it to learn anything. Getting started is easy...
        </p>
        <Grid container justify='center'>
          <Grid item>
            <div className={classes.instructionsContainer}>
              <div className={classes.instructionsNumbers}>1</div>
              <span className={classes.instructionsText}>To experience it in action, click Test Drive</span>
            </div>
            <div className={classes.instructionsContainer}>
              <div className={classes.instructionsNumbers}>2</div>
              <span className={classes.instructionsText}>Next, sign up to create your own account</span>
            </div>
            <div className={classes.instructionsContainer}>
              <div className={classes.instructionsNumbers}>3</div>
              <span className={classes.instructionsText}>Add a series of questions and answers</span>
            </div>
            <div className={classes.instructionsContainer}>
              <div className={classes.instructionsNumbers}>4</div>
              <span className={classes.instructionsText}>Test yourself regularly to build your skills</span>
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={40} justify='center' className={classes.buttonRow}>
          <Grid item>
            <Button component={Link} to='/test' variant='contained' className='button-general'>
              Test Drive
            </Button>
          </Grid>
          {!localStorage.isLoggedIn && (
            <>
              <Grid item>
                <Button onClick={this.login} variant='contained' className={classes.ctaMinorButton}>
                  Login / Sign Up
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
