import { useLayoutEffect, useState } from "react";
import { useStore } from "../state";

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

type Status = 'selected' | 'hovering' | 'default';
type MCQAnswer = { label: string, value: number };
type Textbox = 'textbox'
type Intbox = 'intbox';
type Answer = MCQAnswer | Textbox | Intbox;

type UpdateAnswerFunc = (value: object) => void;
type Question = {
  title: string;
  answers: Answer[];
}

const agreeScale = [
  {
    label: "Strongly disagree",
    value: 0
  },
  {
    label: "Moderately disagree",
    value: 1
  },
  {
    label: "Neither agree nor disagree",
    value: 2
  },
  {
    label: "Moderately Agree",
    value: 3
  },
  {
    label: "Strongly Agree",
    value: 4
  }
];

const questions = [
  {
    title: "What is your age",
    answers: ['intbox']
  },
  {
    title: "What is your gender",
    answers: [
      {
        label: 'Female',
        value: 0
      },
      {
        label: 'Male',
        value: 1
      },
      {
        label: 'Prefer to self describe:',
        value: 2
      },
      {
        label: 'Prefer to not disclose',
        value: 3
      },

    ]
  },
  {
    title: "What is your race/ethnicity?",
    answers: [
      {
        label: 'White',
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
        label: 'Prefer to self describe',
        value: 3
      },
      'textbox'
    ]
  },
  {
    title: "I see myself as extroverted and enthusiastic",
    answers: agreeScale
  },
  {
    title: "I see myself as sympathetic and warm",
    answers: agreeScale
  },
  {
    title: "I see myself as organized and self-disciplined",
    answers: agreeScale
  },
  {
    title: "I see myself as calm and emotionally stable",
    answers: agreeScale
  },
  {
    title: "I see myself as open to new experiences and unconventional",
    answers: agreeScale
  },
];


function Questions() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const updateAnswerFactory = (i: number): UpdateAnswerFunc => {
    return (value: object) => {
      const newAnswers = answers.slice();
      newAnswers[i] = value;
      setAnswers(newAnswers);
    };
  };

  const active = answers.find(x => x === null) === undefined;
  return (
    <>
      <div>
        {questions.map((question, i) =>
          <div className={"py-5 " + (i !== 0 ? "border-t-gray-300 border-t" : "")}>
            <MultipleChoiceQuestion  {...question} updateAnswer={updateAnswerFactory(i)} key={question.title} />
          </div>
        )}
      </div>
      <SubmitButton
        active={active}
        onClick={() => console.log(answers)}
      />
    </>
  );
}

function GenderQuestion({ updateAnswer }: { updateAnswer: UpdateAnswerFunc }) {
  return (
    <div>
      <h2>What is your gender?</h2>
      <div>
        ``
      </div>
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

function AnswerOption({ status, answer, updateChoice }: { status: Status, answer: MCQAnswer, updateChoice: UpdateAnswerFunc }) {
  return (
    <div
      className={`flex flex-row justify-start items-center ${status === 'hovering' ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => { updateChoice(answer.value) }}
    >

      <Checkbox status={status}></Checkbox>
      <div className="px-2">
        {answer.label}
      </div>
    </div >
  );
}


function MultipleChoiceQuestion({ title, answers, updateAnswer }: { title: string, answers: Answer[], updateAnswer: UpdateAnswerFunc }) {
  const [hovering, setHovering] = useState<null | number>(null);
  const [selected, setSelected] = useState<null | number>(null);

  const updateChoiceFactory = (i: number) => {
    return (value: number) => {
      setSelected(i);
      updateAnswer(value);
    };
  };

  return (
    <div
      onPointerLeave={() => setHovering(null)}
    >
      <h2 className="font-semibold text-xl">{title}</h2>
      {
        answers.map((answer, i) => {
          let status: Status = 'default';
          if (i === selected) {
            status = 'selected';
          } else if (i === hovering) {
            status = 'hovering';
          }

          return (
            <div onPointerEnter={() => setHovering(i)} key={answer.label}>
              <AnswerOption
                status={status}
                answer={answer}
                updateChoice={updateChoiceFactory(i)}
              />
            </div>
          );
        })
      }
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
