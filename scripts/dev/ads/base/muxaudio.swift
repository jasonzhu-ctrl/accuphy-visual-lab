// Adds a WAV sound track to a finished MP4 (video passthrough, sound as AAC). Replaces frames2mp4a's single-pass writer,
// which stalled on long films (the two writer inputs deadlocked on interleaving). usage: muxaudio <in.mp4> <audio.wav> <out.mp4>
import AVFoundation
let a = CommandLine.arguments
let video = AVURLAsset(url: URL(fileURLWithPath: a[1])), audio = AVURLAsset(url: URL(fileURLWithPath: a[2])), out = URL(fileURLWithPath: a[3])
func tracks(_ asset: AVAsset, _ type: AVMediaType) -> [AVAssetTrack] {
  let sem = DispatchSemaphore(value: 0); var t: [AVAssetTrack] = []
  asset.loadTracks(withMediaType: type) { r, _ in t = r ?? []; sem.signal() }; sem.wait(); return t
}
func duration(_ asset: AVAsset) -> CMTime {
  let sem = DispatchSemaphore(value: 0); var d = CMTime.zero
  asset.loadValuesAsynchronously(forKeys: ["duration"]) { d = asset.duration; sem.signal() }; sem.wait(); return d
}
guard let v = tracks(video, .video).first, let s = tracks(audio, .audio).first else { fatalError("no video or audio track") }
let comp = AVMutableComposition()
let vd = duration(video), ad = duration(audio)
let vt = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
try vt.insertTimeRange(CMTimeRange(start: .zero, duration: vd), of: v, at: .zero)
let at = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
try at.insertTimeRange(CMTimeRange(start: .zero, duration: CMTimeMinimum(vd, ad)), of: s, at: .zero) // the sound stops with the picture
try? FileManager.default.removeItem(at: out)
guard let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetPassthrough) else { fatalError("no export session") }
ex.outputURL = out; ex.outputFileType = .mp4
let sem = DispatchSemaphore(value: 0); ex.exportAsynchronously { sem.signal() }; sem.wait()
print(ex.status == .completed ? "ok \(out.path) \(CMTimeGetSeconds(vd)) s" : "failed \(String(describing: ex.error))")
