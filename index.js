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
import { targetValue, preventDefault } from "@hyperapp/events";

const mdash = "\u2014";
const MAX_BAD_GUESSES = 7;

// UTILITIES

const contains = (list, item) => list.indexOf(item) > -1;

const range = length => {
  const result = [];
  let i = 1;
  while (i <= length) {
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
  div(
    { class: "word" },
    state.word.map(letter => WordLetter(letter, isGuessed(letter, state)))
  );

const BadGuesses = guesses =>
  div({ class: "guesses" }, [
    range(MAX_BAD_GUESSES - guesses.length).map(life =>
      span({ class: "guess" }, "♥️")
    ),
    guesses.map(guess => span({ class: "guess linethrough" }, guess))
  ]);

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
    div({}, [
      div({ class: "header" }, [
        div([h1("Hangman."), h2({ class: "subtitle" }, "A hyperapp game")]),
        div({}, BadGuesses(getBadGuesses(state)))
      ]),
      state.word.length > 0 &&
        (isGameOver(state)
          ? h2({}, `Game Over! The word was "${state.word.join("")}"`)
          : isVictorious(state)
          ? [h2({}, "You Won!"), Word(state)]
          : [
              Word(state),
              p(
                { style: { textAlign: "center" } },
                "Type a letter to have a guess."
              ),
              UserInput(state.guessedLetter)
            ])
    ]),
  node: document.getElementById("app")
});
