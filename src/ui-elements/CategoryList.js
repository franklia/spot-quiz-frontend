import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import ConfirmUserCredentials from '../helpers/ConfirmUserCredentials.js';
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  CircularProgress,
  Link
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ModalCreateCategory from '../ui-elements/ModalCreateCategory';
import ModalUpdateCategory from '../ui-elements/ModalUpdateCategory';
import ModalDeleteCategory from '../ui-elements/ModalDeleteCategory';

const styles = theme => ({
  narrowCells: {
    width: '15%',
  },
  table: {
    '& th, td': {
      fontSize: 16,
    },
    marginBottom: 30,
  },
});

class CategoryList extends Component {
  constructor(props){
    super(props);

    this.state = {
      auth0Id: '',
      receivedCategories: false,
      userCategories: [],
      updateCategoryName: '',
      createCategoryModalOpen: false,
      deleteCategoryModalOpen: false,
      updateCategoryModalOpen: false,
      updateOrDeleteCategoryId: '',
    }
  }

  componentDidMount = () => {
    const { auth } = this.props;
    ConfirmUserCredentials(auth, this.setUserData, () => {});
  }

  setUserData = id => {
    axios.get(`${process.env.REACT_APP_API_URI}/user/categories?`, { params: { auth0Id: id } })
      .then((res) => {
        if (res.data[0].categories.length < 1){
          this.setState({
            ...this.state,
            auth0Id: id,
            receivedCategories: true
          })
        } else {
          this.setState({
            ...this.state,
            auth0Id: id,
            userCategories: res.data[0].categories,
            receivedCategories: true
          }, () => {console.log(this.state);})
        }
      })
      .catch(error => console.log(error))
  }

  openCreateModal = () => {
    this.setState({
      createCategoryModalOpen: true,
    })
  }

  closeModal = (stateName) => {
    this.setState({
      [stateName]: false,
    })
  }

  openUpdateOrDeleteModal = (stateName, categoryId, categoryName) => {
    this.setState({
      [stateName]: true,
      updateOrDeleteCategoryId: categoryId,
      updateCategoryName: categoryName,
    });

    // autoFocus in Material UI Input fields has a bug so this was used to focus on element
    setTimeout(
      () => {
        if (document.getElementById('outlined-name')){
          document.getElementById('outlined-name').focus();
        }
      }, 500
    );
  }

  handleCategoryTextChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {

    const { classes } = this.props;
    const { receivedCategories, userCategories } = this.state;

    if (receivedCategories === false){
      return (
        <>
          <CircularProgress className={classes.progress} />
          <p>Loading categories...</p>
        </>
      );
    } else if (receivedCategories === true && userCategories.length === 0) {
      return (
        <>
          <p>You haven't added any categories yet. <Link className={classes.link} onClick={this.openCreateModal}> Create one now</Link></p>
        </>
      )
    } else if (receivedCategories === true && userCategories.length > 0) {

      return (
        <div>
          <Paper className={classes.root}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Category Name</TableCell>
                  <TableCell className={classes.narrowCells} align='center'>Edit</TableCell>
                  <TableCell className={classes.narrowCells} align='center'>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.userCategories.map(category => (
                  <TableRow key={category._id}>
                    <TableCell className={classes.category}>
                      {category.name}
                    </TableCell>
                    <TableCell className='link' align='center'>
                      <IconButton onClick={() => this.openUpdateOrDeleteModal('updateCategoryModalOpen', category._id, category.name)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell className='link' align='center'>
                      <IconButton onClick={() => this.openUpdateOrDeleteModal('deleteCategoryModalOpen', category._id)}>
                        <DeleteForeverIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Button onClick={this.openCreateModal} variant='contained' color='primary' className='button-general' type='button'>
            Add New Category
          </Button>
          <ModalCreateCategory
            createCategoryModalOpen={this.state.createCategoryModalOpen}
            closeModal={this.closeModal}
            auth0Id={this.state.auth0Id}
            setUserData={this.setUserData}
          />
          <ModalUpdateCategory
            updateCategoryModalOpen={this.state.updateCategoryModalOpen}
            closeModal={this.closeModal}
            auth0Id={this.state.auth0Id}
            updateOrDeleteCategoryId={this.state.updateOrDeleteCategoryId}
            updateCategoryName={this.state.updateCategoryName}
            setUserData={this.setUserData}
            handleCategoryTextChange={this.handleCategoryTextChange}
          />
          <ModalDeleteCategory
            deleteCategoryModalOpen={this.state.deleteCategoryModalOpen}
            closeModal={this.closeModal}
            auth0Id={this.state.auth0Id}
            updateOrDeleteCategoryId={this.state.updateOrDeleteCategoryId}
            setUserData={this.setUserData}
          />
        </div>
      );
    }
  }
}

CategoryList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CategoryList);
