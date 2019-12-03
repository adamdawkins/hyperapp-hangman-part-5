import { app } from "hyperapp";
import {
  div,
  h1,
  h2,
  img,
  p,
  span,
  input,
  label,
  form,
  button
} from "@hyperapp/html";
import { get } from "@hyperapp/http";
import { targetValue, preventDefault, onKeyDown } from "@hyperapp/events";

const mdash = "\u2014";
const MAX_BAD_GUESSES = 7;

// UTILITIES

const contains = (list, item) => list.indexOf(item) > -1;

const range = (start, end) => {
  const result = [];
  let i = start;
  while (i <= end) {
    result.push(i);
    i++;
  }

  return result;
};

// HELPERS
const isGuessed = (letter, state) => contains(state.guesses, letter);
const isInWord = (letter, state) => contains(state.word, letter);

const getBadGuesses = state =>
  state.guesses.filter(guess => !isInWord(guess, state));

const isVictorious = state =>
  state.word.every(letter => isGuessed(letter, state));

const isGameOver = state => getBadGuesses(state).length >= MAX_BAD_GUESSES;

const isPlaying = state => !(isGameOver(state) || isVictorious(state));

const keyCodeIsLetter = keyCode => keyCode >= 65 && keyCode <= 90;

const isNewLetter = (state, letter) => !contains(state.guesses, letter);

const getInitialState = () => [
  {
    guesses: [],
    word: []
  },
  getWord()
];

// EFFECTS

const getWord = () =>
  get({
    url: `https://adamdawkins.uk/randomword.json`,
    expect: "json",
    action: SetWord
  });

// ACTIONS

const GuessLetter = (state, event) =>
  isPlaying(state) &&
  keyCodeIsLetter(event.keyCode) &&
  isNewLetter(state, event.key)
    ? {
        ...state,
        guesses: state.guesses.concat([event.key])
      }
    : state;

const SetWord = (state, { word }) => ({
  ...state,
  word: word.split("")
});

const ResetGame = getInitialState();

// VIEWS

const WordLetter = (letter, guessed) =>
  span({ class: "letter" }, guessed ? letter : mdash);

const Word = state =>
  div(
    { class: "word" },
    state.word.map(letter => WordLetter(letter, isGuessed(letter, state)))
  );

const BadGuesses = guesses =>
  div({ class: "guesses" }, [
    range(1, MAX_BAD_GUESSES - guesses.length).map(life =>
      span({ class: "guess" }, "♥️")
    ),
    guesses.map(guess => span({ class: "guess linethrough" }, guess))
  ]);

const PlayAgain = () => button({ onclick: ResetGame }, "Play again");

const Header = state =>
  div({ class: "header" }, [
    div([h1("Hangman."), h2({ class: "subtitle" }, "A hyperapp game")]),
    div({}, BadGuesses(getBadGuesses(state)))
  ]);

const GameOver = state => [
  h2({}, `Game Over! The word was "${state.word.join("")}"`),
  PlayAgain()
];

const Victory = state => [h2({}, "You Won!"), PlayAgain(), Word(state)];

const TheGame = state => [
  Word(state),
  p({ style: { textAlign: "center" } }, "Type a letter to have a guess.")
];

// THE APP

app({
  init: getInitialState(),
  view: state =>
    div({}, [
      Header(state),
      state.word.length > 0 &&
        (isGameOver(state)
          ? GameOver(state)
          : isVictorious(state)
          ? Victory(state)
          : TheGame(state))
    ]),
  subscriptions: () => [onKeyDown(GuessLetter)],
  node: document.getElementById("app")
});
