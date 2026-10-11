'use strict';

// One decoded buffer and one source per game, independent of the speech/SFX EQ.
class AIIBackgroundMusic {
  constructor(context, output) {
    this.context = context;
    this.output = output;
    this.buffer = null;
    this.loading = null;
    this.source = null;
    this.gain = null;
    this.wanted = false;
    this.generation = 0;
  }

  load() {
    if (this.buffer) return Promise.resolve(this.buffer);
    if (!this.loading) {
      this.loading = (async () => {
        const response = await fetch('audio/boxing-loop.mp3?v=suno-1');
        if (!response.ok) throw new Error('Music ' + response.status);
        this.buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        return this.buffer;
      })().finally(() => { this.loading = null; });
    }
    return this.loading;
  }

  async start() {
    // Repeated pointer/keyboard events must not restart or layer the loop.
    if (this.wanted) return;
    this.wanted = true;
    const generation = ++this.generation;
    try {
      const [buffer] = await Promise.all([this.load(), this.context.resume()]);
      if (!this.wanted || generation !== this.generation) return;
      if (document.hidden || this.context.state !== 'running') {
        this.wanted = false;
        return;
      }
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = buffer.duration;
      gain.gain.value = .032;
      source.connect(gain).connect(this.output);
      this.source = source;
      this.gain = gain;
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (this.source === source) { this.source = null; this.gain = null; }
      };
      source.start();
    } catch (error) {
      if (generation === this.generation) this.wanted = false;
      console.warn('Background music unavailable; game sound is still available.', error);
    }
  }

  stop() {
    this.wanted = false;
    ++this.generation; // Invalidate an in-flight download or decode.
    if (this.source) {
      const source = this.source, gain = this.gain;
      this.source = null;
      this.gain = null;
      try { source.stop(); } catch {}
      source.disconnect();
      gain.disconnect();
    }
  }
}
