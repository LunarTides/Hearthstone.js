import { FFmpeggy } from "ffmpeggy";
import ffmpegBin from "ffmpeg-static";
import { path as ffprobeBin } from "ffprobe-static";

FFmpeggy.DefaultConfig = {
	...FFmpeggy.DefaultConfig,
	ffprobeBin,
	ffmpegBin: ffmpegBin!,
};
