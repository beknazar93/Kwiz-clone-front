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
      correctAnswer: ''
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
          correctAnswer: q.correct_answer
        });
      })
      .catch(err => console.error("Error fetching question", err));
  }

  updateQuestion() {
    const { question, answer1, answer2, answer3, answer4, correctAnswer, id } = this.state;
    if (question && answer1 && answer2 && answer3 && answer4 && correctAnswer && id) {
      axios.put(`https://kwiz-clone2.onrender.com/api/questions/${id}/`, {
        question,
        answer1,
        answer2,
        answer3,
        answer4,
        correct_answer: correctAnswer
      })
      .then(res => {
        if (res.status === 200) {
          this.props.navigate('/host/questions'); // ✅ переход после обновления
        } else {
          alert('Something went wrong :(');
        }
      })
      .catch(err => {
        console.error("Error updating question", err);
        alert("Error updating question");
      });
    } else {
      alert('All fields must be completed');
    }
  }

  render() {
    return (
<div className='mapped-container'>
  <Link to='/host/questions' className='mapped-container__btn-link'>
    go back
  </Link>
  <div className='mapped-container__new-q'>
    <label>Question</label>
    <input value={this.state.question} onChange={(e) => this.setState({ question: e.target.value })} />
  </div>
  <div className='mapped-container__new-q'>
    <label>Answer1</label>
    <input value={this.state.answer1} onChange={(e) => this.setState({ answer1: e.target.value })} />
  </div>
  <div className='mapped-container__new-q'>
    <label>Answer2</label>
    <input value={this.state.answer2} onChange={(e) => this.setState({ answer2: e.target.value })} />
  </div>
  <div className='mapped-container__new-q'>
    <label>Answer3</label>
    <input value={this.state.answer3} onChange={(e) => this.setState({ answer3: e.target.value })} />
  </div>
  <div className='mapped-container__new-q'>
    <label>Answer4</label>
    <input value={this.state.answer4} onChange={(e) => this.setState({ answer4: e.target.value })} />
  </div>
  <div className='mapped-container__new-q'>
    <label>Correct Answer</label>
    <input type='number' value={this.state.correctAnswer} onChange={(e) => this.setState({ correctAnswer: e.target.value })} />
    <button className='mapped-container__update-btn' onClick={() => this.updateQuestion()}>Update</button>
  </div>
</div>

    );
  }
}

export default EditQuestionWrapper;
