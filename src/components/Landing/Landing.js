import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { handleNickname, selectedPin } from "../../Ducks/Reducer";
import Kwizz from "../../Assests/Kwizz.svg";
import Kwizzard from "../../Assests/Kwizzard-character.png";

// Обёртка для навигации с классовым компонентом
function LandingWrapper(props) {
  const navigate = useNavigate();
  return <Landing {...props} navigate={navigate} />;
}

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: "",
      nickname: "",
      step: 1,
    };
  }

  handlePinChange = (e) => {
    this.setState({ pin: e.target.value });
  };

  handleNicknameChange = (e) => {
    this.setState({ nickname: e.target.value });
  };

  handlePinSubmit = () => {
    const pin = this.state.pin.trim();
    if (!pin || isNaN(Number(pin))) {
      alert("Введите корректный PIN.");
      return;
    }
    this.props.selectedPin(Number(pin));
    this.setState({ step: 2 });
  };

  handleNicknameSubmit = () => {
    const nickname = this.state.nickname.trim();
    if (!nickname) {
      alert("Введите имя.");
      return;
    }
    this.props.handleNickname(nickname);
    this.props.navigate("/player"); // ✅ Игрок уходит на /player
  };

  render() {
    const { step, pin, nickname } = this.state;
    return (
      <div className="quiz">
        <div className="quiz__container">
          <div className="quiz__logo">
            <img src={Kwizz} alt="Kwizz" />
          </div>

          {step === 1 ? (
            <div className="quiz__input-section">
              <input
                type="number"
                placeholder="Введите PIN"
                value={pin}
                onChange={this.handlePinChange}
                className="quiz__input"
              />
              <button onClick={this.handlePinSubmit} className="quiz__button">Далее</button>
            </div>
          ) : (
            <div className="quiz__input-section">
              <input
                type="text"
                placeholder="Введите ваше имя"
                value={nickname}
                onChange={this.handleNicknameChange}
                className="quiz__input"
              />
              <button onClick={this.handleNicknameSubmit} className="quiz__button">Играть!</button>
            </div>
          )}
        </div>

        <div className="quiz__host-section">
          <img src={Kwizzard} alt="host" className="quiz__host-img" />

          <Link to="/host" className="quiz__link">
            <button className="quiz__host-button">HOST</button>
            </Link>
        </div>
      </div>
    );
  }
}

export default connect(null, { handleNickname, selectedPin })(LandingWrapper);
