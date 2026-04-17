import "./index.css";
import { Composition } from "remotion";
import { UnicoPromo, TOTAL_FRAMES } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="UnicoPromo"
      component={UnicoPromo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
