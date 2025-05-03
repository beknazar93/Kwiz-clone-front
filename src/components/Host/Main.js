import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom"; // ⬅ заменили Redirect на Navigate
import axios from "axios";
import { connect } from "react-redux";
import { selectedQuiz, editingQuiz } from "../../Ducks/Reducer";
import Kwizz from "../../Assests/logo.png";

class Main extends Component {
  constructor() {
    super();
    this.state = {
      quizzes: [],
      redirect: false,
    };
    this.setRedirect = this.setRedirect.bind(this);
  }

  componentDidMount() {
    this.getQuizzes();
  }

  getQuizzes() {
    axios
      .get("https://kwiz-clone2.onrender.com/api/quizzes/")
      .then((res) => {
        this.setState({ quizzes: res.data });
      })
      .catch((err) => console.error("Error fetching quizzes:", err));
  }

  setRedirect(quiz) {
    this.props.selectedQuiz(quiz);
    this.setState({ redirect: true });
  }

  deleteQuiz(id) {
    axios
      .delete(`https://kwiz-clone2.onrender.com/api/quizzes/${id}/`)
      .then((res) => {
        if (res.status === 204 || res.status === 200) {
          this.getQuizzes();
        } else {
          alert("Something went wrong :(");
        }
      })
      .catch((err) => console.error("Error deleting quiz:", err));
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to="/game" />;
    }

    const mappedQuizzes = this.state.quizzes.map((quiz) => (
      <div key={quiz.id} className="main__card">
        <h1 className="main__title">{quiz.quiz_name}</h1>
        <p className="main__description">{quiz.info}</p>
        <div className="main__actions">
          <button
            onClick={() => this.setRedirect(quiz)}
            className="main__button"
          >
            Играть
          </button>
          <button
            onClick={() => this.deleteQuiz(quiz.id)}
            className="main__button"
          >
            Удалить
          </button>
          <Link to="/host/questions">
            <button
              onClick={() => this.props.editingQuiz(quiz)}
              className="main__button"
            >
              Изменить
            </button>
          </Link>
        </div>
      </div>
    ));

    return (
      <div className="main">
        <div className="main__header">
          <img src={Kwizz} alt="kwizz logo" className="main__logo" />
        </div>
        <div className="main__new-quiz">
          <Link to="/host/newquiz" className="main__link">
            <button className="main__button--new">Новая игра!</button>
          </Link>
        </div>
        <div className="main__list">{mappedQuizzes}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    quiz: state.quiz,
  };
}

export default connect(mapStateToProps, { selectedQuiz, editingQuiz })(Main);
