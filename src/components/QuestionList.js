import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {
  TableRow,
  Paper,
  TableHead,
  TableCell,
  TableBody,
  Table,
  IconButton,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@material-ui/core';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  category: {
    textTransform: 'capitalize',
  }
});

class QuestionList extends React.Component {
  constructor(props) {
    super(props);

    this.deleteQuestion = this.deleteQuestion.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      questionsData: [],
      deleteId: '',
      dialogOpen: false,
    };
  }

  componentDidMount() {

    const { auth } = this.props;

    if (auth.userProfile) {
      this.getQuestions(auth.userProfile.sub);
      auth.renewSession(() => {});
      // The else if below renews user data if the page is refreshed
    } else if (localStorage.getItem('isLoggedIn') === 'true') {
      auth.renewSession((profile) => {
        auth.getProfile((profile) => {
          if (profile) {
            this.setState({ userId: profile.sub },
              () => this.getQuestions(profile.sub)
            )
          }
        })
      });
    }
  }

  getQuestions = (userId) => {
    axios.get('http://localhost:3001/api/questions/index', { params: { userId: userId } })
      .then((res) => {
        console.log('response');
        console.log(res);
        this.setState({questionsData: res.data});
      }
    )
      .catch(error => console.log(error))
  };

  handleClickOpen = (id) => {
    this.setState({
      dialogOpen: true,
      deleteId: id
    });
  };

  handleClose = () => {
    this.setState({ dialogOpen: false });
  };

  deleteQuestion = () => {
    console.log(this.state.deleteId);
    axios.delete(`http://localhost:3001/api/question/delete/${this.state.deleteId}`)
      .then(() => {
        this.setState({dialogOpen: false});
        this.getQuestions();
      })
      .catch(error => console.log(error))
  };

  render() {
    const { classes } = this.props;
    const { questionsData } = this.state;

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Answers</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questionsData.map(question => (
              <TableRow key={question._id}>
                <TableCell className={classes.category}>{question.category}</TableCell>
                <TableCell>
                  {question.questions.map((question, index) => {
                    let adjustedIndex = index + 1;
                    return ` ${adjustedIndex}. ${question.sub_question}`;
                  })}
                </TableCell>
                <TableCell>
                  {question.questions.map((question, index) => {
                    let adjustedIndex = index + 1;
                    return ` ${adjustedIndex}. ${question.sub_answer}`;
                  })}
                </TableCell>
                <TableCell>{question.status.toString()}</TableCell>
                <TableCell className='link'>
                  <Link href={`/question/${question._id}`}>
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </Link>
                </TableCell>
                <TableCell className='link'>
                  <IconButton>
                    <DeleteForeverIcon
                      onClick={() => this.handleClickOpen(question._id)}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Delete Question</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you wish to delete this question?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              No
            </Button>
            <Button onClick={this.deleteQuestion} color="primary" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }
}

// are propTypes required for material ui??
QuestionList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(QuestionList);
