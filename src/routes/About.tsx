import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full justify-center">
      <div className="w-3/5 py-20">
        <h1 className="border-b border-gray-300 text-2xl font-bold py-1">
          Our Mission
        </h1>
        <div className="py-10">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nobis possimus facere adipisci perspiciatis natus dolorum, dolorem nostrum voluptatibus minus officia magni ducimus quod quis eum voluptatem earum quisquam et distinctio, ab quidem alias at. Illum aspernatur fugiat nesciunt est accusantium corrupti voluptas consequuntur quidem obcaecati quaerat! Iusto omnis cupiditate quas.
        </div>
        <div className="flex w-full justify-end">
          <button className="bg-blue-500 py-2 px-4 text-white w-fit rounded "
            onClick={() => navigate('/plane')}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
