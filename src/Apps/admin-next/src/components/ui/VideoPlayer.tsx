"use client";
import React, { useState } from "react";

interface VideoPlayerProps {
  url: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  className = "w-full" 
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const playPause = (): void => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full relative">
      <video
        src={url}
        onClick={playPause}
        controls={true}
        className={className}
      />
    </div>
  );
};

export default VideoPlayer;
