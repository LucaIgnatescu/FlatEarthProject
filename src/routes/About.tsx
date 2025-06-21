import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full justify-center">
      <div className="w-3/5 py-20">
        <h1 className="border-b border-gray-300 text-2xl font-bold py-1">
          Our Mission
        </h1>
        <div className="py-2 *:mb-3">
          <p>
            Many people believe that the earth is flat, and there is a good reason for this belief. Primarily, lived experience strongly suggests that this is the case. To any observer standing on the surface, the appearance of the Earth is clearly flat. But of course, appearances can be deceiving.

          </p>
          <p>
            As members of society, we inevitably must outsource facts about reality to others. Most of us are not astronauts or pilots, but these pilots and astronauts can provide us with information we do not have first hand access to. For this system to work smoothly, however, there is a presumption of trust. Unfortunately, trust in the integrity of institutions has collapsed, and it is now at historic lows. There are many reasons for this. Institutions are not immune to mission drift, ideological capture, and blatant self interest.
          </p>
          <p>
            We cannot solve these problems here, but what we can do is introduce a trustless method where you can verify for yourself whether the earth is flat. You're smart, and it is through your own reasoning that you must convince yourself whether the earth is flat or not. Specifically, the only information we rely on is the distances between known major cities, which you can measure and confirm for yourself. Our claim is that nobody, not even you, will be able to fit the distances between the world’s cities in a planar configuration. We are putting up a million dollar reward to anyone that manages to do this.
          </p>
          <p>
            Let’s see if you can do it!
          </p>
        </div>
        <div className="flex w-full justify-end">
          <button className="bg-blue-500 py-2 px-4 text-white w-fit rounded "
            onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
