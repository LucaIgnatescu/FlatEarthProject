import { useLayoutEffect, useState } from "react";
import { useStore } from "../state";

export default function Survey() {
  const updateRoute = useStore(state => state.updateRoute);

  useLayoutEffect(() => {
    updateRoute('survey');
  }, [updateRoute]);

  return (
    <div className="px-32 py-10">
      <Questions />
    </div>
  );
}

type Status = 'selected' | 'hovering' | 'default';
type Answer = { label: string, value: number };
type UpdateAnswerFunc = (value: number) => void;

function Questions() {
  const questions: { title: string, answers: Answer[] }[] = [
    {
      title: "Lorem ipsum 1",
      answers: [
        {
          label: "Answer 1",
          value: 1
        }, {
          label: "Answer 2",
          value: 2
        }
      ]
    },
    {
      title: "Lorem ipsum 2",
      answers: [
        {
          label: "Answer 1",
          value: 0
        }, {
          label: "Answer 2",
          value: 1
        }
      ]
    },
  ];

  const [answers, setAnswers] = useState(Array(questions.length).fill(null));

  const updateAnswerFactory = (i: number): UpdateAnswerFunc => {
    return (value: number) => {
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
          <MultipleChoiceQuestion  {...question} updateAnswer={updateAnswerFactory(i)} key={question.title} />
        )}
      </div>
      <SubmitButton
        active={active}
        onClick={() => console.log(answers)}
      />
    </>
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

function AnswerOption({ status, answer, updateChoice }: { status: Status, answer: Answer, updateChoice: UpdateAnswerFunc }) {
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
    <div className=" py-5"
      onPointerLeave={() => setHovering(null)}
    >
      <h2>{title}</h2>
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
    return (<span className="inline-block border-black border rounded-full w-4 h-4 visible bg-black"></span>);
  }
  if (status === 'hovering') {
    return (<span className="inline-block border-black border rounded-full w-4 h-4 visible bg-gray-200"></span>);
  }
  return (
    <span className="inline-block border-black border transition ease-in bg-white rounded-full w-4 h-4 visible"></span>
  );
}
