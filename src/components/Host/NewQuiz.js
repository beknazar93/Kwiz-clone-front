import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { editingQuiz } from '../../Ducks/Reducer';
import { useNavigate } from 'react-router-dom';

class NewQuiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quiz_name: '',
      info: ''
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleTextarea = this.handleTextarea.bind(this);
    this.createQuiz = this.createQuiz.bind(this);
  }

  handleInput(e) {
    this.setState({ quiz_name: e.target.value });
  }

  handleTextarea(e) {
    this.setState({ info: e.target.value });
  }

  createQuiz() {
    axios.post('https://kwiz-clone2.onrender.com/api/quizzes/', {
      quiz_name: this.state.quiz_name,
      info: this.state.info
    })
      .then(res => {
        this.props.editingQuiz(res.data);
        this.props.navigate('/host/questions'); // ✅ redirect с помощью navigate
      })
      .catch(err => {
        console.error("Error creating quiz:", err);
        alert('Something went wrong :(');
      });
  }

  render() {
    return (
      <div class='new-quiz'>
        <div class='new-quiz__form'>
          <label class='new-quiz__label'>Название игры</label>
          <input class='new-quiz__input' onChange={this.handleInput} type='text' />
          <label class='new-quiz__label'>Описание</label>
          <textarea class='new-quiz__textarea' onChange={this.handleTextarea}></textarea>
          <div class='new-quiz__actions'>
            <button onClick={this.createQuiz} class='new-quiz__button'>Ок, Начали</button>
          </div>
        </div>
      </div>

    );
  }
}

// 👇 обёртка для получения навигации в классовом компоненте
const NewQuizWithNavigation = (props) => {
  const navigate = useNavigate();
  return <NewQuiz {...props} navigate={navigate} />;
};

export default connect(null, { editingQuiz })(NewQuizWithNavigation);
