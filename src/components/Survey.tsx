import { useState } from "react";

export type UpdateAnswerFunc = (value: unknown) => void;
export type Status = 'selected' | 'hovering' | 'default';
export type MCQAnswer = { label: string, value: number };

export function ErrorMessage({ type }: { type: number }) {
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

export function AnswerOption({ status, answer, updateChoice }: { status: Status, answer: string, updateChoice: () => void }) {
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

export function StandardMCQ(
  { title, answers, updateAnswer }:
    { answers: string[], updateAnswer: UpdateAnswerFunc, title: string }
) {
  const choices = answers.map((answer, i) => ({
    label: answer,
    value: i
  }));

  return (<MultipleChoiceQuestion title={title} answers={choices} updateAnswer={updateAnswer} />);
}

export function MultipleChoiceQuestion(
  { title, answers, updateAnswer }:
    { title: string, answers: MCQAnswer[], updateAnswer: UpdateAnswerFunc }
) {
  const [hovering, setHovering] = useState<null | number>(null);
  const [selected, setSelected] = useState<null | number>(null);


  const updateChoiceFactory = (i: number) => {
    return () => {
      setSelected(i);
      updateAnswer({ value: answers[i].value });
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

export function SubmitButton({ active, onClick }: { active: boolean, onClick: () => void }) {
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


export function Checkbox({ status }: { status: Status }) {
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
