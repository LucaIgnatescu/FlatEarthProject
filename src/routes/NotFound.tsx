import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const base = import.meta.env.BASE_URL || "/";
  const navigate = useNavigate();
  return (
    <div className="bg-black w-full h-full text-center text-white flex flex-col justify-center">
      <div className="w-full ">
        <h1 className="text-3xl font-bold">404</h1>
        <h2 className="text-lg">This is not the page you are looking for!</h2>
        <div className="w-full flex justify-center my-10">
          <img src={`${base}img/rotating.gif`} className="w-40" />
        </div>
        <button
          className="p-1 w-fit rounded bg-gray-400 hover:bg-blue-400"
          onClick={() => navigate(-1)}>
          Take me back!</button>
      </div>
    </div>
  );
}
