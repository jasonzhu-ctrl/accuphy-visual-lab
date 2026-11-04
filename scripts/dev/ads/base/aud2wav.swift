// aud2wav <in.mp4> <out.wav>: a film's first audio track as 16-bit 48 kHz stereo WAV, to measure what the file really carries (loudness.py).
import AVFoundation
let a = CommandLine.arguments, asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let sem = DispatchSemaphore(value: 0); var track: AVAssetTrack?
asset.loadTracks(withMediaType: .audio) { t, _ in track = t?.first; sem.signal() }; sem.wait()
guard let tr = track else { print("no audio track"); exit(1) }
let r = try! AVAssetReader(asset: asset)
let o = AVAssetReaderTrackOutput(track: tr, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: 48000, AVNumberOfChannelsKey: 2, AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false, AVLinearPCMIsBigEndianKey: false, AVLinearPCMIsNonInterleaved: false])
r.add(o); r.startReading(); var data = Data()
while let sb = o.copyNextSampleBuffer(), let bb = CMSampleBufferGetDataBuffer(sb) { var len = 0; var p: UnsafeMutablePointer<Int8>?; CMBlockBufferGetDataPointer(bb, atOffset: 0, lengthAtOffsetOut: nil, totalLengthOut: &len, dataPointerOut: &p); data.append(Data(bytes: p!, count: len)) }
var h = Data(); func u32(_ v: UInt32) { var x = v.littleEndian; h.append(Data(bytes: &x, count: 4)) }; func u16(_ v: UInt16) { var x = v.littleEndian; h.append(Data(bytes: &x, count: 2)) }
h.append("RIFF".data(using: .ascii)!); u32(UInt32(36 + data.count)); h.append("WAVEfmt ".data(using: .ascii)!); u32(16); u16(1); u16(2); u32(48000); u32(48000 * 4); u16(4); u16(16); h.append("data".data(using: .ascii)!); u32(UInt32(data.count))
try! (h + data).write(to: URL(fileURLWithPath: a[2])); print("audio \(Double(data.count) / 192000) s")
