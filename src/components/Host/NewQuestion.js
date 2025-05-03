import React, { Component } from 'react';
import axios from 'axios';
import { Link, Navigate, useParams } from 'react-router-dom';

// HOC для передачи useParams в class component
function withRouter(Component) {
  return function WrappedComponent(props) {
    const params = useParams();
    return <Component {...props} params={params} />;
  };
}

class New_Question extends Component {
  constructor() {
    super();
    this.state = {
      question: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      correct_answer: '',
      redirect: false
    };
    this.addQuestion = this.addQuestion.bind(this);
  }

  addQuestion() {
    const { question, answer1, answer2, answer3, answer4, correct_answer } = this.state;
    const { id } = this.props.params;

    if (question && answer1 && answer2 && answer3 && answer4 && correct_answer) {
      axios.post('https://kwiz-clone2.onrender.com/api/questions/', {
        question,
        answer1,
        answer2,
        answer3,
        answer4,
        correct_answer,
        quiz: id
      })
        .then(res => {
          if (res.status === 201 || res.status === 200) {
            this.setState({ redirect: true });
          } else {
            alert('Something went wrong :(');
          }
        })
        .catch(err => {
          console.error("Error creating question", err);
          alert('Something went wrong :(');
        });
    } else {
      alert('All fields must be completed');
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to='/host/questions' />;
    }

    return (
      <div className='background'>
        <Link to='/host/questions' className='btn-go-back'>Назад :)</Link>
        <br />
        <div className='new-questions-wrapper'>
          <div className='new-question'>
            <label>Вопрос</label>
            <input onChange={(e) => this.setState({ question: e.target.value })} />
          </div>
          <div className='new-question'>
            <label>Вариант 1</label>
            <input onChange={(e) => this.setState({ answer1: e.target.value })} />
          </div>
          <div className='new-question'>
            <label>Вариант 2</label>
            <input onChange={(e) => this.setState({ answer2: e.target.value })} />
          </div>
          <div className='new-question'>
            <label>Вариант 3</label>
            <input onChange={(e) => this.setState({ answer3: e.target.value })} />
          </div>
          <div className='new-question'>
            <label>Вариант 4</label>
            <input onChange={(e) => this.setState({ answer4: e.target.value })} />
          </div>
          <div className='new-question'>
            <label>Правильный вариант</label>
            <input type='number' min='1' max='4' onChange={(e) => this.setState({ correct_answer: e.target.value })} />
          </div>
          <div className='new-question-action'>
            <button onClick={this.addQuestion} className='btn-new'>Добавить</button>
          </div>
        </div>
      </div>

    );
  }
}

export default withRouter(New_Question);
