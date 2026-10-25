# Viewer behavior

ZIP はファイル選択・ドロップの両方で開ける。中央ディレクトリとローカルヘッダーから
非圧縮 / deflate の譜面・音源だけを展開し、ZIP 内のパスで音源を照合する。ファイル名は
UTF-8 フラグがあれば UTF-8、それ以外は厳密な UTF-8 を試してから Shift-JIS で読む。
暗号化・未対応方式・ディレクトリ・入れ子 ZIP・画像・動画は読み飛ばし、ZIP64 はエラーにする。
複数譜面はタイトル・難易度名・レベルの選択欄で切り替える。初期選択は難易度番号、次に
レベルの大きい譜面。切り替えると再生を停止して音源を再照合する。単一譜面では選択欄を隠す。

The page is self-contained. It starts with a file picker; `ksmauto preview` embeds the chart and optional audio. Open KSON/KSH and audio in either
order, together, or by dropping a folder. Audio is matched against
`audio.bgm.filename`, with a fallback when there is only one audio file. Opening
another chart replaces playback without reloading. KSH decoding supports UTF-8
and Windows Shift_JIS. No server or external URLs are required, including in a
sandboxed iframe with scripts enabled. Audio format support depends on the browser.

The viewer supports KSON auto/manual tilt (including keep, immediate changes and
quadratic curves), camera body graphs (`zoom_top`, `zoom_bottom`, `zoom_side`,
`rotation_deg`, `center_split`), slam spin/half-spin/swing, and the default slam
shake. Highway and judgment-line rotations are evaluated separately. KSH before
version 167 uses the legacy zoom formulas. Camera smoothing is sampled at 120 Hz
in chart time so pause, seeking and slowed playback show a repeatable camera pose;
this approximates KSM's frame-driven smoothing. The procedural judgment line and
cursor approximate the original textured planes and billboards.

Both 2D and 3D use the same highway drawing and account for `beat.scroll_speed`
(including curves and reverse scroll) and `beat.stop`. Stops freeze scroll for
the specified pulse interval; audio and camera time continue. The seek bar is in
measures. Play/pause, 0.5/0.75/1× playback, hi-speed and effects remain available.
FX/laser audio effects and built-in FX key sounds use the existing approximate
synthesis, independently of scroll. The default-on 「直角音」 checkbox plays laser
slam sounds even without BGM. A short band-pass noise burst and pitched click
approximate the default hit and the up/down/swing variants; mute is silent. The
viewer follows KSM v2's note-time playback: `audio.key_sound.laser.vol` changes
apply at the slam pulse (default 0.5), and `legacy.vol_auto` scales volume by
`min(1, abs(vf - v) * section_width * 2)`. Simultaneous slams use the louder lane.
Only events at actual slam pulses apply. Both KSON `slam_up`/`slam_down`/
`slam_swing`/`slam_mute` and the KSH converter's `up`/`down`/`swing`/`mute` names
are recognized; KSH `chokkakuvol` and `chokkakuautovol` are preserved. Sounds share
the FX key sound output level, independently of BGM's `vol`, and follow the audio
clock through speed changes and seeking. KSM's sound assets are not bundled or
used; unsupported custom slam sounds fall back to the default hit.
Backgrounds, layers, movies, original skin assets, judging, scoring and gameplay
input are not reproduced. Custom sound files
and `switch_audio` are not synthesized.
