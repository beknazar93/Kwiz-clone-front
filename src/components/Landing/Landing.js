// import React, { Component } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { connect } from "react-redux";
// import { handleNickname, selectedPin } from "../../Ducks/Reducer";
// import Kwizz from "../../Assests/Kwizz.svg";
// import Kwizzard from "../../Assests/Kwizzard-character.png";

// // Обёртка для навигации с классовым компонентом
// function LandingWrapper(props) {
//   const navigate = useNavigate();
//   return <Landing {...props} navigate={navigate} />;
// }

// class Landing extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       pin: "",
//       nickname: "",
//       step: 1,
//     };
//   }

//   handlePinChange = (e) => {
//     this.setState({ pin: e.target.value });
//   };

//   handleNicknameChange = (e) => {
//     this.setState({ nickname: e.target.value });
//   };

//   handlePinSubmit = () => {
//     const pin = this.state.pin.trim();
//     if (!pin || isNaN(Number(pin))) {
//       alert("Введите корректный PIN.");
//       return;
//     }
//     this.props.selectedPin(Number(pin));
//     this.setState({ step: 2 });
//   };

//   handleNicknameSubmit = () => {
//     const nickname = this.state.nickname.trim();
//     if (!nickname) {
//       alert("Введите имя.");
//       return;
//     }
//     this.props.handleNickname(nickname);
//     this.props.navigate("/player"); // ✅ Игрок уходит на /player
//   };

//   render() {
//     const { step, pin, nickname } = this.state;
//     return (
//       <div className="quiz">
//         <div className="quiz__container">
//           <div className="quiz__logo">
//             <img src={Kwizz} alt="Kwizz" />
//           </div>

//           {step === 1 ? (
//             <div className="quiz__input-section">
//               <input
//                 type="number"
//                 placeholder="Введите PIN"
//                 value={pin}
//                 onChange={this.handlePinChange}
//                 className="quiz__input"
//               />
//               <button onClick={this.handlePinSubmit} className="quiz__button">Далее</button>
//             </div>
//           ) : (
//             <div className="quiz__input-section">
//               <input
//                 type="text"
//                 placeholder="Введите ваше имя"
//                 value={nickname}
//                 onChange={this.handleNicknameChange}
//                 className="quiz__input"
//               />
//               <button onClick={this.handleNicknameSubmit} className="quiz__button">Играть!</button>
//             </div>
//           )}
//         </div>

//         <div className="quiz__host-section">
//           <img src={Kwizzard} alt="host" className="quiz__host-img" />

//           <Link to="/host" className="quiz__link">
//             <button className="quiz__host-button">Игры</button>
//             </Link>
//         </div>
//       </div>
//     );
//   }
// }

// export default connect(null, { handleNickname, selectedPin })(LandingWrapper);


import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleNickname, selectedPin, setAllowedStudents } from "../../Ducks/Reducer";
import Kwizz from "../../Assests/Kwizz.svg";
import Kwizzard from "../../Assests/Kwizzard-character.png";
import axios from "axios";

const Landing = () => {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState(1);
  const allowedStudents = useSelector((state) => state.allowedStudents || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      axios.get("https://rasu0101.pythonanywhere.com/user/user/").then((res) => {
        const students = res.data[0].schools.flatMap(school => 
          school.levels.flatMap(level => level.participants)
        );
        dispatch(setAllowedStudents(students));
      });
    }
  }, [step, dispatch]);

  const handlePinSubmit = () => {
    const trimmedPin = pin.trim();
    if (!trimmedPin || isNaN(Number(trimmedPin))) {
      alert("Введите корректный PIN.");
      return;
    }
    dispatch(selectedPin(Number(trimmedPin)));
    setStep(2);
  };

  const handleNicknameSubmit = () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      alert("Введите имя.");
      return;
    }
    if (!allowedStudents.includes(trimmedNickname)) {
      alert("У вас нет доступа к этой игре. Ваш никнейм не в списке участников.");
      return;
    }
    dispatch(handleNickname(trimmedNickname));
    navigate("/player");
  };

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
              onChange={(e) => setPin(e.target.value)}
              className="quiz__input"
            />
            <button onClick={handlePinSubmit} className="quiz__button">
              Далее
            </button>
          </div>
        ) : (
          <div className="quiz__input-section">
            <input
              type="text"
              placeholder="Введите ваше имя"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="quiz__input"
            />
            <button onClick={handleNicknameSubmit} className="quiz__button">
              Играть!
            </button>
          </div>
        )}
      </div>

      <div className="quiz__host-section">
        <img src={Kwizzard} alt="host" className="quiz__host-img" />
        <Link to="/" className="quiz__link">
          <button className="quiz__host-button">Добро пожоловать</button>
        </Link>
      </div>
    </div>
  );
};

export default Landing;