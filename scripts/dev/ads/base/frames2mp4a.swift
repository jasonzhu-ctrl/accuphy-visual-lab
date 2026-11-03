// JPEG frames (+ an optional WAV) → H.264 / AAC MP4 (AVAssetWriter). The Base Mini film has sound (#225), and this Mac has no
// ffmpeg, so this is ../frames2mp4.swift with an audio track. usage: frames2mp4a <frameDir> <out.mp4> [fps=30] [bitrate=14000000] [audio.wav]
import AVFoundation
import AppKit
let a = CommandLine.arguments
let dir = URL(fileURLWithPath: a[1]), out = URL(fileURLWithPath: a[2])
let fps = Int32(a.count > 3 ? Int(a[3])! : 30), rate = a.count > 4 ? Int(a[4])! : 14_000_000
let wav: URL? = a.count > 5 ? URL(fileURLWithPath: a[5]) : nil
let files = try FileManager.default.contentsOfDirectory(atPath: dir.path).filter { $0.hasSuffix(".jpg") }.sorted()
guard let first = NSImage(contentsOf: dir.appendingPathComponent(files[0])), let cg0 = first.cgImage(forProposedRect: nil, context: nil, hints: nil) else { fatalError("no frames") }
let W = cg0.width, H = cg0.height
try? FileManager.default.removeItem(at: out)
let w = try AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: rate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 30],
  AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2, AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2, AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2]])
input.expectsMediaDataInRealTime = false
let ad = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
w.add(input)
// the audio: the WAV read back as PCM and written as AAC 48 kHz mono
var audioIn: AVAssetWriterInput? = nil, reader: AVAssetReader? = nil, trackOut: AVAssetReaderTrackOutput? = nil
if let wav = wav {
  let asset = AVURLAsset(url: wav)
  let sem = DispatchSemaphore(value: 0); var tracks: [AVAssetTrack] = []
  asset.loadTracks(withMediaType: .audio) { t, _ in tracks = t ?? []; sem.signal() }; sem.wait()
  guard let track = tracks.first else { fatalError("no audio track in \(wav.path)") }
  reader = try AVAssetReader(asset: asset)
  trackOut = AVAssetReaderTrackOutput(track: track, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM, AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false, AVLinearPCMIsBigEndianKey: false, AVLinearPCMIsNonInterleaved: false])
  reader!.add(trackOut!)
  audioIn = AVAssetWriterInput(mediaType: .audio, outputSettings: [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 48000, AVNumberOfChannelsKey: 1, AVEncoderBitRateKey: 128_000])
  audioIn!.expectsMediaDataInRealTime = false
  w.add(audioIn!)
}
w.startWriting(); w.startSession(atSourceTime: .zero)
// AVAssetWriter interleaves its tracks: with the video far ahead of the audio, the video input stops being ready and waits
// for sound, so the sound is fed along with the picture, up to half a second ahead of the frame being written
var pending: CMSampleBuffer? = nil
if let r = reader { r.startReading(); pending = trackOut!.copyNextSampleBuffer() }
let videoEnd = CMTime(value: Int64(files.count), timescale: fps)
func feedAudio(upTo t: CMTime) {
  guard let ai = audioIn, let to = trackOut else { return }
  while let sb = pending, CMSampleBufferGetPresentationTimeStamp(sb) < t {
    if CMSampleBufferGetPresentationTimeStamp(sb) >= videoEnd { pending = nil; break } // the sound stops with the picture
    while !ai.isReadyForMoreMediaData { usleep(2000) }
    ai.append(sb); pending = to.copyNextSampleBuffer()
  }
}
for (i, f) in files.enumerated() {
  autoreleasepool {
    guard let img = NSImage(contentsOf: dir.appendingPathComponent(f)), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return }
    let pts = CMTime(value: Int64(i), timescale: fps)
    feedAudio(upTo: pts + CMTime(value: 1, timescale: 2))
    while !input.isReadyForMoreMediaData { usleep(2000) }
    var pb: CVPixelBuffer?; CVPixelBufferPoolCreatePixelBuffer(nil, ad.pixelBufferPool!, &pb)
    CVPixelBufferLockBaseAddress(pb!, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
    CVPixelBufferUnlockBaseAddress(pb!, [])
    ad.append(pb!, withPresentationTime: pts)
  }
}
input.markAsFinished()
feedAudio(upTo: videoEnd)
audioIn?.markAsFinished()
let sem2 = DispatchSemaphore(value: 0); w.finishWriting { sem2.signal() }; sem2.wait()
print(w.status == .completed ? "ok \(out.path) \(W)x\(H) \(files.count) frames\(wav != nil ? " + audio" : "")" : "failed \(String(describing: w.error))")
