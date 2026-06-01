interface VideoLessonPlayerProps {
  url: string;
  initialPositionSeconds?: number;
  onTimeUpdate?: (seconds: number, percent: number) => void;
  onEnded?: () => void;
}

const VideoLessonPlayer = ({ url, initialPositionSeconds = 0, onTimeUpdate, onEnded }: VideoLessonPlayerProps) => {
  return (
    <video
      data-testid="video-lesson-player"
      src={url}
      controls
      className="w-full aspect-video rounded-xl bg-black"
      onLoadedMetadata={(e) => {
        const v = e.currentTarget;
        if (initialPositionSeconds > 0 && initialPositionSeconds < v.duration - 1) {
          v.currentTime = initialPositionSeconds;
        }
      }}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        if (!v.duration) return;
        const pct = Math.floor((v.currentTime / v.duration) * 100);
        onTimeUpdate?.(Math.floor(v.currentTime), pct);
      }}
      onEnded={onEnded}
    />
  );
};

export default VideoLessonPlayer;
