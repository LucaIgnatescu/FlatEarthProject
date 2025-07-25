import { useState } from "react";
import { useStore } from "../state";
import { AnswerOption, ErrorMessage, StandardMCQ, Status, SubmitButton, UpdateAnswerFunc } from "../components/Survey";
import { postSurvey1 } from "../metrics/postMetrics";

const NQUESTIONS = 10;

export function IntakeSurvey({ action }: { action: () => void }) {
  const token = useStore(state => state.jwt);
  const [answers, setAnswers] = useState(Array(NQUESTIONS).fill(null));
  const updateAnswerFactory = (i: number): UpdateAnswerFunc => {
    return (value: unknown) => {
      const newAnswers = answers.slice();
      newAnswers[i] = value;
      setAnswers(newAnswers);
    };
  };

  const active = answers.find(x => x === null) === undefined;

  const agreeScale = [
    'Disagree Strongly',
    'Disagree Moderately',
    'Disagree a little',
    'Neither Agree nor Disagree',
    'Agree a little',
    'Agree Moderately',
    'Agree Strongly'
  ];

  const onClick = () => {
    const values = answers.map(answer => answer.value)
    const genderText = answers[1].text;
    const payload = {
      answers: values,
      gender_detail: genderText || null
    };
    postSurvey1(token, payload);
    action();
  }

  return (
    <>
      <div className="*:my-2">
        <AgeQuestion updateAnswer={updateAnswerFactory(0)} />
        <GenderQuestion updateAnswer={updateAnswerFactory(1)} />
        <StandardMCQ updateAnswer={updateAnswerFactory(2)}
          title="What is your race?"
          answers={['White', 'Black', 'Hispanic', 'Asian', 'Other/Multiple']}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(3)}
          title="I see myself as extroverted and enthusiastic"
          answers={agreeScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(4)}
          title="I see myself as sympathetic and warm"
          answers={agreeScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(5)}
          title="I see myself as organized and self-disciplined"
          answers={agreeScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(6)}
          title="I see myself as calm and emotionally stable"
          answers={agreeScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(7)}
          title="I see myself as open to new experiences and unconventional"
          answers={agreeScale}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(8)}
          title="Formal Education (pick highest)"
          answers={['Some High School', 'Completed High School', 'Some College', 'Completed College', 'Advanced Degree (e.g. Masters, MBA, JD)']}
        />
        <StandardMCQ updateAnswer={updateAnswerFactory(9)}
          title="Family Income Level (pick hightest)"
          answers={[
            'Receiving government assistance for poverty',
            'Lower middle class (below average income)',
            'Middle class (about average income)',
            'Upper middle class (higher than average income)',
            'Upper class (far above average income / generational wealth)'
          ]}
        />
      </div>
      <SubmitButton
        active={active}
        onClick={onClick}
      />
    </>
  );
}

function AgeQuestion({ updateAnswer }: { updateAnswer: UpdateAnswerFunc }) {
  const [, setAge] = useState("");
  const [err, setErr] = useState(0);

  const updateAge = (age: string) => {
    setAge(age);
    if (isNaN(+age)) {
      setErr(2);
      updateAnswer(null);
      return;
    }

    if (+age <= 10) {
      setErr(1);
      updateAnswer(null);
      return;
    }

    if (age === "") {
      setErr(0);
      updateAnswer(null);
      return;
    }
    if (+age > 100) {
      setErr(3);
      updateAnswer(null);
      return;
    }
    setErr(0);
    updateAnswer({ value: +age });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">
        What is your age?
      </h2>
      <ErrorMessage type={err} />
      <textarea
        className="border border-black rounded mt-1 h-fit"
        onChange={(e) => updateAge(e.target.value)}
      />
    </div>
  );
}


function GenderQuestion({ updateAnswer }: { updateAnswer: UpdateAnswerFunc }) {
  const answers = [
    {
      label: 'Female',
      value: 0
    },
    {
      label: 'Male',
      value: 1
    },
    {
      label: 'Prefer to not disclose',
      value: 2
    },
    {
      label: 'Prefer to self identify',
      value: 3
    }
  ];

  const [choice, setChoice] = useState<{
    selected: null | number;
    text: null | string;
    hovering: null | number;
  }>({ selected: null, text: null, hovering: null });

  const enabled = choice.selected === answers.length - 1;

  const manageStatus = (i: number): Status => {
    if (i === choice.selected) {
      return 'selected';
    }
    if (i === choice.hovering) {
      return 'hovering';
    }
    return 'default';
  }

  const updateChoiceFactory = (i: number) => {
    return () => {
      setChoice((choice) => ({ ...choice, selected: i }))
      updateAnswer({ value: answers[i].value, text: null })
    }
  }

  const updateHoveringFactory = (i: number) => {
    return () => {
      setChoice(choice => ({ ...choice, hovering: i }))
    }
  }


  const updateTextArea = (newText: string) => {
    if (!enabled) {
      setChoice(choice => ({ ...choice, text: null }));
      updateAnswer({ value: answers.at(-1)?.value, text: null })
      return;
    }
    setChoice(choice => ({ ...choice, text: newText }));
    updateAnswer({ value: answers.at(-1)?.value, text: newText })
  }


  return (
    <div onMouseLeave={() => setChoice(choice => ({ ...choice, hovering: null }))}>
      <h2 className="font-semibold text-xl">What is your gender?</h2>
      <div>
        {
          answers.map((answer, i) =>
            <div onMouseEnter={updateHoveringFactory(i)}
              key={answer.label}
            >
              <
                AnswerOption
                updateChoice={updateChoiceFactory(i)} answer={answer.label}
                status={manageStatus(i)}
              />
            </div>
          )
        }
        <GenderTextArea
          enabled={enabled}
          updateChoice={updateTextArea}
        />
      </div>
    </div>
  );
}


function GenderTextArea(
  { enabled, updateChoice }:
    { enabled: boolean, updateChoice: (value: string) => void }
) {
  const LIMIT = 30;
  const [text, setTextInput] = useState("");

  if (!enabled) {
    return null;
  }

  const updateTextInput = (newText: string) => {
    if (newText.length > LIMIT) {
      newText = newText.slice(0, LIMIT);
    }
    setTextInput(newText);
    updateChoice(newText);
  };

  return (
    <div>
      <h2>If so, indicate:</h2>
      <textarea
        onChange={e => updateTextInput(e.target.value)}
        className="border border-black rounded p-1 w-1/3"
        value={text}
      >
      </textarea>
      <div className={`w-1/3 flex justify-end text-sm ${text.length !== LIMIT ? "text-gray-900" : "text-red"}`}>
        <div>Characters left: {LIMIT - text.length}</div>
      </div>
    </div>
  );
}


