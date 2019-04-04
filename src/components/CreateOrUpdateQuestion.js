import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import CategoryDropdown from './ui-elements/CategoryDropdown';
import { Tooltip, Fab, Button, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './ui-elements/Column';

const styles = theme => ({
  fab: {
    margin: theme.spacing.unit,
  },
  topic: {
    display: 'block',
  },
});

class CreateOrUpdateQuestion extends Component {
  constructor(props){
    super(props);

    // The state.columns and state.columnOrder are used by the react-beautiful-dnd package to order the sub questions. The actual order on the page is stored in this.state.columns['column-1'].questionIds. There is only one column displayed on the page currently but it is set up to accommodate more than one in future if required.

    this.state = {
      category: '',
      topic: '',
      questions: {
        1: {
          id: 1,
          sub_question: '',
          sub_answer: '',
          position: 1
        },
      },
      columns: {
        'column-1': { id: 'column-1', title: 'Questions', questionIds: [1] }
      },
      columnOrder: ['column-1'],
      open: false
    }
  };

    componentDidMount() {
      if (this.props.type === 'update') {
        this.getData();
      }
    };

    getData = () => {
      axios.get('http://localhost:3001/api/question/' + this.props.id)
        .then((res) => {

          // Check if topic exists and if so, update state
          const topicExists = Object.keys(res.data[0]).includes('topic');
          if (topicExists === true) { this.setState({topic: res.data[0].topic })};

          // Prepare const categoryData for eventual update to this.state.category
          const categoryData = res.data[0].category;

          // Prepare const questionsDataObject for eventual update to this.state.questions
          // We need to convert questions array into a nested object to match this.state.questions format
          let questionsData = {};
          const questionsDataArray = res.data[0].questions;
          questionsDataArray.forEach(function(element, index) {
            questionsData[element.id] = element;
          });

          // Prepare const columnData for eventual update to this.state.columns (sort by position)
          function comparePositions(a, b) {
            if (a.position < b.position) {
              return -1;
            }
            if (a.position > b.position) {
              return 1;
            }
            return 0;
          }

          const initialQuestionsSort = questionsDataArray.sort(comparePositions);
          const columnDataArray = initialQuestionsSort.map(question => question.id);

          const columnData = {
            ...this.state.columns['column-1'],
            questionIds: columnDataArray
          };

          // Update state
          this.setState({
            ...this.state,
            category: categoryData,
            questions: questionsData,
            columns: {
              'column-1': columnData
            }
          });
        }
      )
        .catch(error => console.log(error))
    };

  handleCategoryChange = category => {
    this.setState({
      category: category
    });
  };

  // handleTopicChange = event => {
  //   // const value = event.target.value;
  //   this.setState({
  //     topic: event.target.value
  //   });
  // }

  // Refactor the two functions above into this one
  handleDataChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onChangeInput = event => {
    const questionId = event.target.id;
    const key = event.target.name;
    const value = event.target.value;
    let question = {...this.state.questions[questionId], [key]: value};
    this.setState({
      ...this.state,
      questions: {...this.state.questions, [questionId]: question}
    });
  };

  addSubQuestion = () => {
    // Determine the new question key
    const questionIdsArray = this.state.columns['column-1'].questionIds;
    const questionsHighestKey = Math.max(...questionIdsArray);
    const questionNewKey = questionsHighestKey + 1;

    //Determine the new quesiton position (in hindsight I should have simply held the positions in this.state.columns because I'm really duplicating it here. It should be refactored)
    const questionsIdsNumber = questionIdsArray.length;
    const questionNewPosition = questionsIdsNumber + 1;

    // Create new question object
    const subQuestion = { id: questionNewKey, sub_question: '', sub_answer: '', position: questionNewPosition };

    // Create new questionIds array
    const newQuestionIdsArray = questionIdsArray.concat(questionNewKey);

    // Update state
    this.setState({
      ...this.state,
      questions: {...this.state.questions, [questionNewKey]: subQuestion},
      columns: {'column-1': {id: 'column-1', title: 'Questions', questionIds: newQuestionIdsArray}},
    });
  };

  deleteSubQuestion = id => {
    console.log(id);
    // Remove question from this.state.questions object
    const questionsObject = this.state.questions;
    delete questionsObject[id];

    // Remove question id from this.state.columns['column-1'].questionIds
    let questionIdsArray = this.state.columns['column-1'].questionIds;

    for (let i = 0; i < questionIdsArray.length; i++){
      if (questionIdsArray[i] === id) {
        questionIdsArray.splice(i, 1);
      }
    }

    // Update state
    this.setState({
      ...this.state,
      questions: questionsObject,
      columns: {'column-1': {id: 'column-1', title: 'Questions', questionIds: questionIdsArray}},
    });
  };

  // This function reorders the questions in our column
  // It was set up using this tutorial for the react-beautiful-dnd library https://egghead.io/lessons/react-course-introduction-beautiful-and-accessible-drag-and-drop-with-react-beautiful-dnd
  onDragEnd = result => {
    const { destination, source, draggableId } = result;

    // If there is no destination, abort.
    if (!destination) {
      return;
    };

    // If the starting position and the end position is the same, abort.
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    };

    // Reorder column.questionIds to match the new positions of the sub questions
    const column = this.state.columns[source.droppableId];
    const newQuestionIds = Array.from(column.questionIds);
    newQuestionIds.splice(source.index, 1);
    newQuestionIds.splice(destination.index, 0, parseInt(draggableId));

    // Prepare const columnUpdate for eventual update to this.state.columns
    const columnUpdate = {
      ...column,
      questionIds: newQuestionIds,
    };

    // Update the position of each question in this.state.questions (in hindsight I should have simply held the positions in this.state.columns because I'm really duplicating it here - this is yet to be refactored)
    const questionsArrayUpdatePositions = newQuestionIds.map(
      (question_id, arrayIndex) => {
        const adjustArrayIndex = arrayIndex + 1;
        const newQuestion = {
          ...this.state.questions[question_id], position: adjustArrayIndex
        }
        return newQuestion;
      }
    );

    // Prepare const questionsObject for eventual update to this.state.questions
    let questionsObject = {};

    questionsArrayUpdatePositions.forEach(function(element, index) {
      questionsObject[element.id] = element;
    });

    // Update state
    this.setState({
      ...this.state,
      questions: questionsObject,
      columns: {
        ...this.state.columns,
        [columnUpdate.id]: columnUpdate,
      }
    });
  };

  onSubmit = (event) => {
    event.preventDefault();
    // Convert nested questions object into an array of the questions
    const question_values = Object.values(this.state.questions);

    // Function to check if all input fields are populated and create an error object

    // const topicInput = document.querySelector('#topic');
    // topicInput.setCustomValidity('');
    // topicInput.checkValidity();


    // const validate = () => {
    //   if(this.state.category !== ''){ formErrors['category'] = 'You must assign a category'}
    //   if(question_values.every(obj => obj.sub_question !== ''){ formErrors['category'] = 'You must assign a category'}
    // }


    if (
      this.state.category !== ''
      && question_values.every(obj => obj.sub_question !== '')
      && question_values.every(obj => obj.sub_answer !== '')
      // && this.state.columns['column-1'].questionIds.length > 1
    ) {

      // This is a nested if statement to check component type (create or update) and post accordingly
      if (this.props.type === 'create') {

        const dataObject = {
          category: this.state.category,
          questions: question_values,
          status: false,
        };

        if (this.state.topic !== ''){ dataObject['topic'] = this.state.topic };

        axios.post('http://localhost:3001/api/question/create', dataObject)
          .then(res => console.log(res))
          .catch(error => console.log(error));

        this.setState({
          category: '',
          questions: {
            1: {
              id: '1',
              sub_question: '',
              sub_answer: '',
              position: 1
            },
          },
          columns: {
            'column-1': { id: 'column-1', title: 'Questions', questionIds: [1] }
          },
          columnOrder: ['column-1'],
        });

      } else if (this.props.type === 'update') {

        const dataObject = {
          _id: this.props.id,
          category: this.state.category,
          questions: question_values,
          status: false
        };

        if (this.state.topic !== '' && this.state.columns['column-1'].questionIds > 1){
          dataObject['topic'] = this.state.topic 
        };
        console.log(dataObject);

        axios.post(`http://localhost:3001/api/question/${dataObject._id}`, dataObject)
          .then(res => console.log(res))
          // .then(this.handleClick())
          .catch(error => console.log(error));
      }

    // Output an error if one or more of the input field are blank
  } else {
      console.log('One or more of the input fields are blank.')
    }
  };

  render() {
    const { classes } = this.props;

    // const isEnabled = this.state.columns['column-1'].questionIds.length === 1 ||
    //   (this.state.columns['column-1'].questionIds.length > 1 && this.state.topic !== '');
    // console.log(isEnabled);

    const topic = (
      <TextField
      id='topic'
      name='topic'
      label='Topic'
      className={classes.topic}
      value={this.state.topic}
      placeholder='Enter a topic'
      helperText='When you have 2 or more questions, you must add a topic to unify the subject matter.'
      required={true}
      InputLabelProps={{ shrink: true }}
      onChange={this.handleDataChange('topic')}
      margin='normal'
      variant='outlined'
      />
    );

    return (
      <>
        <form onSubmit={() => {}}>
          <CategoryDropdown
            category={this.state.category}
            onCategoryChange={this.handleCategoryChange}
          />

          { /* Dislay topic input field if there is more than one sub question */ }
          { this.state.columns['column-1'].questionIds.length > 1 ? topic : null }

          <DragDropContext onDragEnd={this.onDragEnd}>
            {this.state.columnOrder.map(columnId => {
              const column = this.state.columns[columnId];
              const questions = column.questionIds.map(questionId => this.state.questions[questionId]);
              const displayDeleteIcon = (() => column.questionIds.length >= 2 ? true : false)();

              return <Column
                        key={column.id}
                        column={column}
                        questions={questions}
                        updateInput={this.onChangeInput.bind(this)} deleteSubQuestion={this.deleteSubQuestion.bind(this)}
                        displayDeleteIcon={displayDeleteIcon}
                      />;
            })}
          </DragDropContext>
          <Tooltip title='Add New Sub Question' aria-label='Add'>
            <Fab color='primary' aria-label='Add' className={classes.fab} onClick={this.addSubQuestion}>
              <AddIcon />
            </Fab>
          </Tooltip>
          <Button
            onClick={this.onSubmit} variant='contained' color='primary' style={{marginTop: 25}}
            // disabled={!isEnabled}
          >
            {this.props.buttonText} Question
          </Button>
        </form>
      </>
    );
  }
}

export default withStyles(styles)(CreateOrUpdateQuestion);