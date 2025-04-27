// Loading.tsx
import Lottie from "lottie-react";
// @ts-ignore
import animationData from "public/animation/loadingAnimation.json";

export default function Loading() {
  return (
    <div className="flex justify-center items-center mt-0 mb-0">
      <div className="relative w-30 h-30">
        <Lottie
          animationData={animationData}
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
