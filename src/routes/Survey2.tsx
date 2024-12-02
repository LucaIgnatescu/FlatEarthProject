import { useLayoutEffect, useState } from "react";
import { useStore } from "../state";
import { StandardMCQ, SubmitButton, UpdateAnswerFunc } from "../components/Survey";
import { postSurvey2 } from "../metrics/postMetrics";

const NQUESTIONS = 5;

export function Survey2() {
  const updateRoute = useStore(state => state.updateRoute);

  useLayoutEffect(() => {
    updateRoute('survey2');
  }, [updateRoute]);

  return (
    <div className="flex w-full h-fit min-h-screen justify-center py-10 ">
      <div className="w-3/5 rounded-xl p-5 bg-white h-fit">
        <h1 className="text-2xl font-bold w-full border-b border-gray-300 my-2">
          Intake Survey
        </h1>
        <Questions />
      </div>
    </div>
  );
}



function Questions() {
  const token = useStore(state => state.jwt);
  const [answers, setAnswers] = useState(Array(NQUESTIONS).fill(null));
  const updateAnswerFactory = (i: number): UpdateAnswerFunc => {
    return (value: unknown) => {
      const newAnswers = answers.slice();
      newAnswers[i] = value;
      setAnswers(newAnswers);
    };
  };

  const active = answers.find((x, i) => x === null && i !== answers.length - 1) === undefined;

  const convincedScale = [
    'Fully convinced (~100%)',
    'Strong belief (~80%)',
    'Slight belief (~60%)',
    'On the fence (~50%)',
    'Slight disbelief (~40%)',
    'Strong disbelief (~20%)',
    'Complete disbelief (~0%)'
  ];

  const confidenceScale = [
    'A great deal',
    'A fair amount',
    'Not very much',
    'None at all'
  ];

  const onClick = () => {
    const values = answers.slice(0, -1).map(answer => answer.value);
    const text = answers.at(-1)?.text;
    const payload = {
      answers: values,
      text: text || null
    };
    postSurvey2(token, payload);
  };

  return (
    <>
      <div className="*:my-2">
        <StandardMCQ updateAnswer={updateAnswerFactory(0)}
          title="Before visiting this site, you believe in flat earth about (pick highest)"
          answers={convincedScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(1)}
          title="After doing this challenge, your belief in flat earth is now (pick highest)"
          answers={convincedScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(2)}
          title="In general, how much trust and confidence do you have in the competence of institutions?"
          answers={confidenceScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(3)}
          title="In general, how much trust and confidence do you have in the belief that institutions work on behalf of the welfare of the general public?"
          answers={confidenceScale}
        />
        <FinalTextArea updateAnswer={updateAnswerFactory(4)} />
      </div>
      <SubmitButton
        active={active}
        onClick={onClick}
      />
    </>
  );
}

function FinalTextArea({ updateAnswer }: { updateAnswer: UpdateAnswerFunc }) {
  const LIMIT = 100;
  const [text, setText] = useState("");
  const updateText = (newText: string) => {
    console.log(text);
    if (newText.length > LIMIT) {
      console.log(newText.slice(0, LIMIT))
      setText(newText.slice(0, LIMIT))
      return;
    }
    setText(newText);
    updateAnswer({ text: newText });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">(Optional) If you want to, tell us a bit about your belief in a flat earth. Where does it come from? How did it get started? Why does it persist? What could convince you otherwise?</h2>
      <textarea
        className="border border-black rounded w-full min-h-20"
        onChange={(e) => updateText(e.target.value)}
        value={text}
      />
      <div className={`w-full flex justify-end ${text.length !== LIMIT ? "text-gray-500" : "text-red"}`}>
        <div>Characters: {text.length}/{LIMIT}</div>
      </div>
    </div >
  );
}

