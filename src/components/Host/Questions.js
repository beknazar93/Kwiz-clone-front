import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import { editingQuiz } from '../../Ducks/Reducer';

class Questions extends Component {
  constructor() {
    super();
    this.state = {
      questions: [],
      quiz: {},
      newName: '',
      newInfo: '',
      toggle: false
    };
  }

  componentDidMount() {
    // Сохраняем текущий квиз из Redux
    this.setState({ quiz: this.props.quizToEdit });
    this.getQuestions();
  }

  getQuestions() {
    // Получаем квиз с вложенными вопросами
    axios.get(`https://kwiz-clone2.onrender.com/api/quizzes/${this.props.quizToEdit.id}/`)
      .then(res => {
        // res.data.questions – список вопросов квиза
        this.setState({
          questions: res.data.questions
        });
      })
      .catch(err => console.error("Error fetching questions:", err));
  }

  deleteQuestion(id) {
    axios.delete(`https://kwiz-clone2.onrender.com/api/questions/${id}/`)
      .then(res => {
        // При успешном удалении (204 или 200)
        if (res.status === 204 || res.status === 200) {
          this.getQuestions();
        } else {
          alert('Something went wrong :(');
        }
      })
      .catch(err => console.error("Error deleting question:", err));
  }

  displayEdit() {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  updateQuiz() {
    const { newName, newInfo, quiz } = this.state;
    this.setState({
      toggle: !this.state.toggle
    });
    if (newName && newInfo) {
      axios.put(`https://kwiz-clone2.onrender.com/api/quizzes/${quiz.id}/`, {
        quiz_name: newName,
        info: newInfo
      })
      .then(res => {
        this.handleUpdatedQuiz(quiz.id);
      })
      .catch(err => console.error("Error updating quiz:", err));
    } else {
      alert('All fields must be completed');
    }
  }

  handleUpdatedQuiz(id) {
    axios.get(`https://kwiz-clone2.onrender.com/api/quizzes/${id}/`)
      .then(res => {
        // Обновляем квиз в Redux
        this.props.editingQuiz(res.data);
        this.setState({
          quiz: res.data
        });
      })
      .catch(err => console.error("Error fetching updated quiz:", err));
  }

  render() {
    const { questions, quiz, toggle } = this.state;
  
    return (
      <div className="questions__page">
        <div className="questions__container-center">
          {/* Верхняя кнопка "Done" */}
          <div className="questions__top-bar">
            <Link to="/host">
              <button className="questions__button--done">Done</button>
            </Link>
          </div>
  
          {/* Блок информации о квизе */}
          <div className="questions__quiz-box">
            {!toggle ? (
              <div>
                <h1 className="questions__quiz-title">{quiz.quiz_name}</h1>
                <p className="questions__quiz-desc">{quiz.info}</p>
                <button
                  className="questions__button"
                  onClick={() => this.displayEdit()}
                >
                  Редактировать
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  className="questions__input--title input-edit"
                  placeholder={quiz.quiz_name}
                  onChange={(e) => this.setState({ newName: e.target.value })}
                />
                <textarea
                  className="questions__input--desc input-edit"
                  placeholder={quiz.info}
                  onChange={(e) => this.setState({ newInfo: e.target.value })}
                />
                <div className="questions__actions">
                  <button
                    className="questions__button"
                    onClick={() => this.updateQuiz()}
                  >
                    Сохранить
                  </button>
                  <button
                    className="questions__button"
                    onClick={() => this.displayEdit()}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
  
          {/* Кнопка добавления */}
          <div className="questions__add-button">
            <Link to={`/host/newquestion/${quiz.id}`}>
              <button className="questions__button--new">+ Добавить вопрос</button>
            </Link>
          </div>
  
          {/* Список вопросов */}
          <div className="questions__mapped">
            {questions?.map((question) => (
              <div key={question.id} className="questions__question-card">
                <h3 className="questions__title">{question.question}</h3>
                <ul className="questions__list">
                  <li className="questions__item">1: {question.answer1}</li>
                  <li className="questions__item">2: {question.answer2}</li>
                  <li className="questions__item">3: {question.answer3}</li>
                  <li className="questions__item">4: {question.answer4}</li>
                  <li className="questions__item questions__item--correct">
                    Correct: {question.correct_answer}
                  </li>
                </ul>
                <div className="questions__actions">
                  <Link to={`/host/editquestion/${question.id}`}>
                    <button className="questions__button">Редактировать</button>
                  </Link>
                  <button
                    onClick={() => this.deleteQuestion(question.id)}
                    className="questions__button"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  
}

function mapStateToProps(state) {
  return {
    quizToEdit: state.quizToEdit
  };
}

export default connect(mapStateToProps, { editingQuiz })(Questions);
