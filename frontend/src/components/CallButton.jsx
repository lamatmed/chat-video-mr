import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="p-2 sm:p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0 bg-base-100/80 backdrop-blur-sm z-10">
      <button 
        onClick={handleVideoCall} 
        className="btn btn-success btn-sm sm:btn-md text-white gap-2"
      >
        <VideoIcon className="size-4 sm:size-5" />
        <span className="hidden sm:inline">Appel vidéo</span>
      </button>
    </div>
  );
}

export default CallButton;
