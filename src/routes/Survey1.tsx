import { useLayoutEffect, useState } from "react";
import { useStore } from "../state";


type UpdateAnswerFunc = (value: unknown) => void;
type Status = 'selected' | 'hovering' | 'default';
type MCQAnswer = { label: string, value: number };

const NQUESTIONS = 10;

export default function Survey() {
  const updateRoute = useStore(state => state.updateRoute);

  useLayoutEffect(() => {
    updateRoute('survey');
  }, [updateRoute]);

  return (
    <div className="flex w-full h-fit min-h-screen justify-center  py-10 ">
      <div className="w-3/5 rounded-xl p-5 bg-white h-fit">
        <h1 className="text-2xl font-bold w-full border-b border-gray-300">
          Intake Survey
        </h1>
        <Questions />
      </div>
    </div>
  );
}



function Questions() {
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

  return (
    <>
      <div>
        <AgeQuestion updateAnswer={updateAnswerFactory(0)} />
        <GenderQuestion updateAnswer={updateAnswerFactory(1)} />
        <StandardMCQ updateAnswer={updateAnswerFactory(2)}
          title="What is your race?"
          answers={['white', 'black', 'hispanic', 'asian', 'other/multiple']}
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
          answers={['Some High School', 'Completed High School', 'Some College', 'Advanced Degree (e.g. Masters, MBA, JD)']}
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
        onClick={() => console.log(answers)}
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
      return;
    }

    if (+age <= 10) {
      setErr(1);
      return;
    }

    if (age === "") {
      setErr(0);
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
        className="border border-black"
        onChange={(e) => updateAge(e.target.value)}
      />
    </div>
  );
}

function ErrorMessage({ type }: { type: number }) {
  if (type === 0) {
    return null;
  }

  if (type === 1) {
    return (<p className="text-red">Please enter an age above 10.</p>);
  }

  if (type === 2) {
    return (<p className="text-red">Please enter a number.</p>);
  }
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
                updateChoice={updateChoiceFactory(i)}
                answer={answer.label}
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
  const [, setTextInput] = useState("");

  if (!enabled) {
    return null;
  }

  const updateTextInput = (newVal: string) => {
    setTextInput(newVal);
    updateChoice(newVal);
  };

  return (
    <div>
      <h2>If so, indicate:</h2>
      <textarea
        onChange={e => updateTextInput(e.target.value)}
        className="border border-black rounded p-1"
      >
      </textarea>
    </div>
  );
}


function AnswerOption({ status, answer, updateChoice }: { status: Status, answer: string, updateChoice: () => void }) {
  return (
    <div
      className={`flex flex-row justify-start items-center ${status === 'hovering' ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => { updateChoice() }}
    >

      <Checkbox status={status}></Checkbox>
      <div className="px-2">
        {answer}
      </div>
    </div >
  );
}

function StandardMCQ(
  { title, answers, updateAnswer }:
    { answers: string[], updateAnswer: UpdateAnswerFunc, title: string }
) {
  const choices = answers.map((answer, i) => ({
    label: answer,
    value: i
  }));

  return (<MultipleChoiceQuestion title={title} answers={choices} updateAnswer={updateAnswer} />);
}

function MultipleChoiceQuestion(
  { title, answers, updateAnswer }:
    { title: string, answers: MCQAnswer[], updateAnswer: UpdateAnswerFunc }
) {
  const [hovering, setHovering] = useState<null | number>(null);
  const [selected, setSelected] = useState<null | number>(null);


  const updateChoiceFactory = (i: number) => {
    return () => {
      setSelected(i);
      updateAnswer({ value: answers[i].value, text: null })
    }
  }

  const manageStatus = (i: number): Status => {
    if (i === selected) {
      return 'selected';
    }
    if (i === hovering) {
      return 'hovering';
    }
    return 'default';
  }

  return (
    <div
      onPointerLeave={() => setHovering(null)}
    >
      <h2 className="font-semibold text-xl">{title}</h2>
      {
        answers.map((answer, i) => {
          return (
            <div onPointerEnter={() => setHovering(i)} key={answer.label}>
              <AnswerOption
                status={manageStatus(i)}
                answer={answer.label}
                updateChoice={updateChoiceFactory(i)}
              />
            </div>
          );
        })
      }
    </div>
  );
}

function SubmitButton({ active, onClick }: { active: boolean, onClick: () => void }) {
  return (
    <div
      className={
        "bg-blue-500 p-5 text-white w-fit rounded transition-opacity duration-500 " +
        (active ? "opacity-100 hover:cursor-pointer" : "opacity-50 disabled")
      }
      onClick={onClick}
    >
      Submit
    </div>
  );
}


function Checkbox({ status }: { status: Status }) {
  if (status === 'selected') {
    return (<span className="inline-block border-black transition ease-in duration-100 border rounded-full w-4 h-4 visible bg-black"></span>);
  }
  if (status === 'hovering') {
    return (<span className="inline-block border-black transision ease-in duration-100 border rounded-full w-4 h-4 visible bg-gray-200"></span>);
  }
  return (
    <span className="inline-block border-black border transition ease-in  duration-100 bg-white rounded-full w-4 h-4 visible"></span>
  );
}
