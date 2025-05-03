// Файл: src/utils/AudioManager.js

class AudioManager {
  constructor() {
    this.instances = new Set();
    this.muted = false;
  }

  play(src, { loop = false } = {}) {
    if (this.muted) return null;
    const audio = new Audio(src);
    audio.loop = loop;
    audio.play().catch(() => {});
    this.instances.add(audio);
    audio.addEventListener("ended", () => this.instances.delete(audio));
    return audio;
  }

  stopAll() {
    this.instances.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.instances.clear();
  }

  muteAll() {
    this.muted = true;
    this.instances.forEach((audio) => {
      audio.muted = true;
    });
  }

  unmuteAll() {
    this.muted = false;
    this.instances.forEach((audio) => {
      audio.muted = false;
    });
  }
}

export default new AudioManager();
