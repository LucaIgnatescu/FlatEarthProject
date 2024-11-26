import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BugReport() {
  const [subject, setSubject] = useState("");
  const [report, setReport] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex w-full min-h-screen h-fit justify-center ">
      <div className="w-2/3 mt-20">
        <h1 className="text-2xl font-bold border-b border-gray-300 py-2 ">Bug Report</h1>
        <div className="my-2 border-b border-gray-300 pb-2">
          <p>
            If you encountered in our app, please let us know by describing the issue in as much detail as possible, including steps to reproduce if possible.
          </p>
          <p>
            We thank you for your support!
          </p>
        </div >
        <form
          className="my-5"
          onSubmit={(e) => {
            e.preventDefault();
            console.log(subject, report);
          }}
        >
          <label htmlFor='subject' className="my-1 font-semibold block">
            Subject
          </label>
          <input
            type='text'
            id='subject'
            onChange={(e) => setSubject(e.target.value)}
            className="my-2 block border-gray-500 border rounded p-0.5 w-2/5 font-normal"
          >
          </input>
          <label htmlFor='report' className="my-1 font-semibold block">
            What is the issue?
          </label>
          <textarea
            id='report'
            onChange={(e) => setReport(e.target.value)}
            className="my-2 block border-gray-500 border rounded p-0.5 w-full font-normal min-h-32 h-fit"
          >
          </textarea>
          <div className="flex w-full justify-between">
            <input
              type='submit'
              className=" bg-blue-500 p-3 text-white w-fit rounded"
            />
            <button className="bg-blue-500 p-3 text-white w-fit rounded "
              onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </form>
      </div >
    </div >
  );
}
