let contexteAudio: AudioContext | null = null;
let sonAutorise = false;

function obtenirContexteAudio() {
  if (contexteAudio) return contexteAudio;
  contexteAudio = new AudioContext();
  return contexteAudio;
}

export function initialiserAlerteSonore() {
  if (typeof window === "undefined" || sonAutorise) return () => undefined;

  const autoriser = () => {
    const contexte = obtenirContexteAudio();
    void contexte.resume();
    sonAutorise = true;
    nettoyer();
  };
  const nettoyer = () => {
    window.removeEventListener("pointerdown", autoriser);
    window.removeEventListener("keydown", autoriser);
  };

  window.addEventListener("pointerdown", autoriser, { once: true });
  window.addEventListener("keydown", autoriser, { once: true });
  return nettoyer;
}

export async function jouerAlerteSonore() {
  if (!sonAutorise || typeof window === "undefined") return;
  const contexte = obtenirContexteAudio();
  if (contexte.state === "suspended") await contexte.resume();

  const jouerNote = (frequence: number, debut: number) => {
    const oscillateur = contexte.createOscillator();
    const volume = contexte.createGain();
    oscillateur.type = "sine";
    oscillateur.frequency.setValueAtTime(frequence, debut);
    volume.gain.setValueAtTime(0.0001, debut);
    volume.gain.exponentialRampToValueAtTime(0.14, debut + 0.015);
    volume.gain.exponentialRampToValueAtTime(0.0001, debut + 0.18);
    oscillateur.connect(volume);
    volume.connect(contexte.destination);
    oscillateur.start(debut);
    oscillateur.stop(debut + 0.2);
  };

  const maintenant = contexte.currentTime + 0.02;
  jouerNote(740, maintenant);
  jouerNote(988, maintenant + 0.13);
}
