const initialState = {
  quiz: {},
  nickname: "",
  selectedPin: 0,
  quizToEdit: {},
  profile: { schools: [] },
  selectedSchool: null,
  selectedLevel: null,
  allowedStudents: [],
};

const SELECTED_QUIZ = "SELECTED_QUIZ";
const NEW_NICKNAME = "NICKNAME";
const SELECTED_PIN = "SELECTED_PIN";
const QUIZ_TO_EDIT = "QUIZ_TO_EDIT";
const SET_PROFILE = "SET_PROFILE";
const SELECTED_SCHOOL = "SELECTED_SCHOOL";
const SELECTED_LEVEL = "SELECTED_LEVEL";
const SET_ALLOWED_STUDENTS = "SET_ALLOWED_STUDENTS";

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SELECTED_QUIZ:
      return Object.assign({}, state, { quiz: action.payload });
    case NEW_NICKNAME:
      return Object.assign({}, state, { nickname: action.payload });
    case SELECTED_PIN:
      return Object.assign({}, state, { selectedPin: action.payload });
    case QUIZ_TO_EDIT:
      return Object.assign({}, state, { quizToEdit: action.payload });
    case SET_PROFILE:
      return Object.assign({}, state, { profile: action.payload });
    case SELECTED_SCHOOL:
      return Object.assign({}, state, { selectedSchool: action.payload });
    case SELECTED_LEVEL:
      return Object.assign({}, state, { selectedLevel: action.payload });
    case SET_ALLOWED_STUDENTS:
      const normalizedStudents = action.payload.map((student) =>
        student.trim().toLowerCase()
      );
      console.log("Reducer.js: Обновлён список allowedStudents:", normalizedStudents);
      return Object.assign({}, state, { allowedStudents: normalizedStudents });
    default:
      return state;
  }
}

export function selectedQuiz(quiz) {
  return { type: SELECTED_QUIZ, payload: quiz };
}

export function handleNickname(nickname) {
  return { type: NEW_NICKNAME, payload: nickname };
}

export function selectedPin(pin) {
  return { type: SELECTED_PIN, payload: pin };
}

export function editingQuiz(quiz) {
  return { type: QUIZ_TO_EDIT, payload: quiz };
}

export function setProfile(profile) {
  return { type: SET_PROFILE, payload: profile };
}

export function selectedSchool(school) {
  return { type: SELECTED_SCHOOL, payload: school };
}

export function selectedLevel(level) {
  return { type: SELECTED_LEVEL, payload: level };
}

export function setAllowedStudents(students) {
  return { type: SET_ALLOWED_STUDENTS, payload: students };
}