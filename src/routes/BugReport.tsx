import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state";
import { postBug } from "../metrics/postMetrics";

export default function BugReport() {
  const [report, setReport] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const token = useStore(state => state.jwt);

  const disabled = report === "";
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
            const payload = {
              report,
              email
            };
            postBug(token, payload);
          }}
        >
          <label htmlFor='report' className="my-1 font-semibold block">
            What is the issue?
          </label>
          <textarea
            id='report'
            onChange={(e) => setReport(e.target.value)}
            className="my-2 block border-gray-500 border rounded p-0.5 w-full font-normal min-h-32 h-fit"
          >
          </textarea>
          <p className="my-1">If you would like to be kelp updated with the progress on this issue, you can include your email below. </p>

          <label htmlFor="email" className="my-1 font-semibold block">
            Email (optional)
          </label>

          <input type="text"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            className="my-2 block border-gray-500 border rounded p-0.5 font-normal w-1/3"
          />

          <div className="flex w-full justify-between mt-3">
            <button className="bg-blue-500 p-3 text-white w-fit rounded "
              onClick={() => navigate(-1)}>
              Back
            </button>
            <input
              type='submit'
              className={
                `p-3 text-white w-fit rounded ${disabled ? "bg-gray-500" : "bg-blue-500 transition-all hover:bg-blue-800 hover:cursor-pointer"}`}
              disabled={disabled}
            />
          </div>
        </form>
      </div >
    </div >
  );
}
