// Adds a WAV sound track to a finished MP4 without touching the picture: the H.264 samples are copied one by one with their own
// timing (every frame stays 1/30 s), the sound is encoded as AAC 256 kbit/s, 48 kHz stereo. usage: muxpass <in.mp4> <audio.wav> <out.mp4>
// Why (PingLive ad r1, Lab HQ 11-05): muxaudio.swift's passthrough export of a composition stretched the last frame to 0.1 s
// (stts 1019 × 1/30 + 1 × 3/30, media duration 34.067 s), so tools that divide frames by the media duration read 29.94 fps.
// muxaudio.swift is left as it is for the Mini's make-preview.sh.
import AVFoundation
let a = CommandLine.arguments
let vAsset = AVURLAsset(url: URL(fileURLWithPath: a[1])), aAsset = AVURLAsset(url: URL(fileURLWithPath: a[2])), out = URL(fileURLWithPath: a[3])
func first(_ asset: AVAsset, _ type: AVMediaType) -> AVAssetTrack {
  let sem = DispatchSemaphore(value: 0); var t: AVAssetTrack?
  asset.loadTracks(withMediaType: type) { r, _ in t = r?.first; sem.signal() }; sem.wait()
  guard let tr = t else { fatalError("no \(type.rawValue) track in \(asset)") }; return tr
}
let vt = first(vAsset, .video), at = first(aAsset, .audio)
let fmt: CMFormatDescription = { let sem = DispatchSemaphore(value: 0); var f: CMFormatDescription?
  vt.loadValuesAsynchronously(forKeys: ["formatDescriptions"]) { f = (vt.formatDescriptions.first as! CMFormatDescription); sem.signal() }; sem.wait(); return f! }()
let vDur: CMTime = { let sem = DispatchSemaphore(value: 0); var d = CMTime.zero
  vAsset.loadValuesAsynchronously(forKeys: ["duration"]) { d = vAsset.duration; sem.signal() }; sem.wait(); return d }()
let vr = try AVAssetReader(asset: vAsset), ar = try AVAssetReader(asset: aAsset)
let vo = AVAssetReaderTrackOutput(track: vt, outputSettings: nil); vo.alwaysCopiesSampleData = false; vr.add(vo)
let ao = AVAssetReaderTrackOutput(track: at, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: 48000, AVNumberOfChannelsKey: 2, AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false, AVLinearPCMIsBigEndianKey: false, AVLinearPCMIsNonInterleaved: false]); ar.add(ao)
ar.timeRange = CMTimeRange(start: .zero, duration: vDur) // the sound stops with the picture
try? FileManager.default.removeItem(at: out)
let w = try AVAssetWriter(outputURL: out, fileType: .mp4)
let vi = AVAssetWriterInput(mediaType: .video, outputSettings: nil, sourceFormatHint: fmt); vi.expectsMediaDataInRealTime = false
let ai = AVAssetWriterInput(mediaType: .audio, outputSettings: [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 48000, AVNumberOfChannelsKey: 2, AVEncoderBitRateKey: 256000]); ai.expectsMediaDataInRealTime = false
w.add(vi); w.add(ai)
vr.startReading(); ar.startReading(); w.startWriting(); w.startSession(atSourceTime: .zero)
let group = DispatchGroup(); var nv = 0
func pump(_ input: AVAssetWriterInput, _ output: AVAssetReaderTrackOutput, _ q: String, _ count: (() -> Void)?) {
  group.enter()
  input.requestMediaDataWhenReady(on: DispatchQueue(label: q)) {
    while input.isReadyForMoreMediaData {
      guard let sb = output.copyNextSampleBuffer() else { input.markAsFinished(); group.leave(); return }
      if !input.append(sb) { print("append failed: \(String(describing: w.error))"); input.markAsFinished(); group.leave(); return }
      count?()
    }
  }
}
pump(vi, vo, "v") { nv += 1 }; pump(ai, ao, "a", nil)
group.wait() // no endSession(atSourceTime:): with it the writer stretched the last frame to cover the B-frame delay (the same 29.94 reading)
let sem = DispatchSemaphore(value: 0); w.finishWriting { sem.signal() }; sem.wait()
print(w.status == .completed ? "ok \(out.path) \(nv) video samples, \(CMTimeGetSeconds(vDur)) s" : "failed \(String(describing: w.error))")
