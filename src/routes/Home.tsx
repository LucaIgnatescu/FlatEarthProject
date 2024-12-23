import { useNavigate } from "react-router-dom";

export default function Home() {
  const base = import.meta.env.BASE_URL || "/";
  const navigate = useNavigate();
  return (
    <div className="w-full h-full flex justify-center align-center flex-col bg-black">
      <div className="flex flex-col justify-center flex-grow">
        <div className="flex flex-row w-full justify-center">
          <div className="w-1/3 text-center">
            <div className="w-full flex justify-center">
              <img src={`${base}img/rotating.gif`} className="w-40" />
            </div>
            <h1 className="text-center text-white text-2xl font-semibold "> The Flat Earth Challenge</h1>
            <button
              className="text-xl text-gray-400 mt-20 border-2 rounded-lg border-gray-400 px-2 py-1 hover:border-white hover:text-white"
              onClick={() => navigate('/tutorial/1')}
            >Tutorial</button>
          </div>
        </div>
      </div>
      <div className="h-1/5 w-full"></div>
    </div>
  );
}
