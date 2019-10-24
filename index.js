import { app } from "hyperapp";
import {
  div,
  h1,
  h2,
  ul,
  li,
  span,
  input,
  label,
  form,
  button
} from "@hyperapp/html";
import { get } from "@hyperapp/http";
import { targetValue, preventDefault } from "@hyperapp/events";

const mdash = "\u2014";
const MAX_BAD_GUESSES = 7;

// UTILITIES

const contains = (list, item) => list.indexOf(item) > -1;

// HELPERS
const isGuessed = (letter, state) => contains(state.guesses, letter);
const isInWord = (letter, state) => contains(state.word, letter);

const badGuesses = state =>
  state.guesses.filter(guess => !isInWord(guess, state));

const isVictorious = state =>
  state.word.every(letter => isGuessed(letter, state));

const isGameOver = state => badGuesses(state).length >= MAX_BAD_GUESSES;

// EFFECTS

// ACTIONS

const GuessLetter = state => ({
  ...state,
  guesses: state.guesses.concat([state.guessedLetter]),
  guessedLetter: ""
});

const SetGuessedLetter = (state, letter) => ({
  ...state,
  guessedLetter: letter
});

const SetWord = (state, { word }) => ({
  ...state,
  word: word.split("")
});

// VIEWS

const WordLetter = (letter, guessed) =>
  span({ class: "letter" }, guessed ? letter : mdash);

const Word = state =>
  h1(
    {},
    state.word.map(letter => WordLetter(letter, isGuessed(letter, state)))
  );

const BadGuesses = state => [
  h2({}, "Your Guesses:"),
  ul(
    { class: "guesses" },
    badGuesses(state).map(guess => li({ class: "guess" }, guess))
  )
];

const UserInput = letter =>
  form({ onSubmit: preventDefault(GuessLetter) }, [
    label({}, "Your guess:"),
    ,
    input({
      class: "input",
      onInput: [SetGuessedLetter, targetValue],
      type: "text",
      value: letter,
      maxlength: 1
    }),
    button({ type: "submit" }, "Guess!")
  ]);

const getWord = () =>
  get({
    url: `https://adamdawkins.uk/randomword.json`,
    expect: "json",
    action: SetWord
  });
// THE APP

app({
  init: [
    {
      word: [],
      guesses: [],
      guessedLetter: ""
    },
    getWord()
  ],
  view: state =>
    div(
      {},
      isGameOver(state)
        ? h1({}, `Game Over! The word was "${state.word.join("")}"`)
        : isVictorious(state)
        ? [h1({}, "You Won!"), Word(state)]
        : [UserInput(state.guessedLetter), Word(state), BadGuesses(state)]
    ),
  node: document.getElementById("app")
});
