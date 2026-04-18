import "./index.css";
import { Composition } from "remotion";
import { UnicoPromo, TOTAL_FRAMES } from "./Composition";
import { UnicoNike, NIKE_TOTAL } from "./NikePromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UnicoPromo"
        component={UnicoPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="UnicoNike"
        component={UnicoNike}
        durationInFrames={NIKE_TOTAL}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
