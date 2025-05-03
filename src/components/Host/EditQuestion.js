import React, { Component } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Обёртка для класса с хуками
function EditQuestionWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <EditQuestion id={id} navigate={navigate} />;
}

class EditQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
      question: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      correctAnswer: '',
      quiz: null, // ✅ добавили quiz
    };
  }

  componentDidMount() {
    this.getQuestion();
  }

  getQuestion() {
    axios.get(`https://kwiz-clone2.onrender.com/api/questions/${this.props.id}/`)
      .then(res => {
        const q = res.data;
        this.setState({
          id: q.id,
          question: q.question,
          answer1: q.answer1,
          answer2: q.answer2,
          answer3: q.answer3,
          answer4: q.answer4,
          correctAnswer: q.correct_answer,
          quiz: q.quiz, // ✅ сохранить quiz
        });
      })
      .catch(err => console.error("Ошибка при получении вопроса:", err));
  }

  updateQuestion() {
    const { question, answer1, answer2, answer3, answer4, correctAnswer, id, quiz } = this.state;

    if (question && answer1 && answer2 && answer3 && answer4 && correctAnswer && quiz && id) {
      axios.put(`https://kwiz-clone2.onrender.com/api/questions/${id}/`, {
        question,
        answer1,
        answer2,
        answer3,
        answer4,
        correct_answer: correctAnswer,
        quiz, // ✅ обязательно отправляем quiz
      })
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            this.props.navigate('/host/questions');
          } else {
            alert('Ошибка при обновлении!');
          }
        })
        .catch(err => {
          console.error("Ошибка при отправке обновления:", err);
          alert("Ошибка при обновлении вопроса");
        });
    } else {
      alert('Заполни все поля!');
    }
  }

  render() {
    return (
      <div className="edit-question">
        <div className="edit-question__card">
          <div className="edit-question__header">
            <h2 className="edit-question__title">Изменить вопрос</h2>
            <Link to="/host/questions" className="edit-question__back-btn">
              Назад
            </Link>
          </div>
          <div className="edit-question__field">
            <label className="edit-question__label">Вопрос</label>
            <input
              className="edit-question__input"
              value={this.state.question}
              onChange={(e) => this.setState({ question: e.target.value })}
            />
          </div>
          <div className="edit-question__answers">
            {[1, 2, 3, 4].map(n => (
              <div className="edit-question__field" key={n}>
                <label className="edit-question__label">Вариант {n}</label>
                <input
                  className="edit-question__input"
                  value={this.state[`answer${n}`]}
                  onChange={(e) => this.setState({ [`answer${n}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="edit-question__footer">
            <div className="edit-question__field edit-question__field--correct">
              <label className="edit-question__label">Правильный вариант</label>
              <input
                type="number"
                className="edit-question__input"
                value={this.state.correctAnswer}
                onChange={(e) => this.setState({ correctAnswer: e.target.value })}
                min="1"
                max="4"
              />
            </div>
            <button
              className="edit-question__update-btn"
              onClick={() => this.updateQuestion()}
            >
              Обновить
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default EditQuestionWrapper;
