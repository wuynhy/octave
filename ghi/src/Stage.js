import { useParams } from "react-router-dom";

function Stage() {
  let { id: stageId } = useParams();

  return (
    <div className="container">
      <h1>Stage {stageId}</h1>
    </div>
  );
}

export default Stage;
