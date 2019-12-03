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

// EFFECTS

// ACTIONS

const GuessLetter = (state, event) =>
  // the letter keycodes range from 65-90
  contains(range(65, 90), event.keyCode)
    ? {
        ...state,
        guesses: state.guesses.concat([event.key])
      }
    : state;

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
    range(1, MAX_BAD_GUESSES - guesses.length).map(life =>
      span({ class: "guess" }, "♥️")
    ),
    guesses.map(guess => span({ class: "guess linethrough" }, guess))
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
      word: ["h", "e", "l", "l", "o"],
      guesses: [],
      guessedLetter: ""
    }
    // getWord()
  ],
  view: state => {
    console.log(state);
    return div({}, [
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
              )
            ])
    ]);
  },
  subscriptions: () => [onKeyDown(GuessLetter)],
  node: document.getElementById("app")
});
