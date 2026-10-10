"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, AudioLines, Check, FileText } from "lucide-react";
import { AudioPlayer } from "@natlaskit/react";
import { languages, type Language } from "natlaskit";
import { demoAudio } from "@/lib/demo-audio";
export function HomePreview() {
  const [audio, setAudio] = useState<Blob | null>(null);
  const [language, setLanguage] = useState<Language>("hausa");
  useEffect(() => setAudio(demoAudio()), []);
  const selected = languages.find((item) => item.id === language)!;
  return (
    <div className="home-preview-wrap">
      <div className="home-preview-topline">
        <span>
          <AudioLines size={13} />
          THE SPEECH WORKSPACE
        </span>
        <span>COMPONENT PREVIEW</span>
      </div>
      <div className="home-preview">
        <div className="home-preview-heading">
          <span className="home-preview-symbol">
            <AudioLines size={19} />
          </span>
          <div>
            <strong>Speech to text</strong>
            <span>Your language. Your application.</span>
          </div>
          <span className="home-preview-tag">
            <i />
            N-ATLAS
          </span>
        </div>
        <div
          className="home-preview-languages"
          role="group"
          aria-label="Preview language"
        >
          {languages.map((item) => (
            <button
              key={item.id}
              aria-pressed={language === item.id}
              onClick={() => setLanguage(item.id)}
            >
              {item.code}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="home-preview-audio">
          {audio ? (
            <AudioPlayer audio={audio} name="audio-preview.wav" />
          ) : (
            <div className="home-audio-placeholder">
              Preparing audio preview…
            </div>
          )}
          <p>Generated tones · try the playback controls</p>
        </div>
        <div className="home-preview-transcript">
          <div>
            <span>
              <FileText size={13} />
              TRANSCRIPT PREVIEW
            </span>
            <Check size={13} />
          </div>
          <p>
            Every voice carries a possibility.
            <br />
            <span>Make room for the next one.</span>
          </p>
          <small>Illustrative text · not a model result</small>
        </div>
        <div className="home-preview-footer">
          <span>
            <i />
            {selected.label} selected
          </span>
          <Link href={`/playground?language=${language}`}>
            Try your own recording <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="home-preview-bottomline">
        <span>Built with @natlaskit/react</span>
        <span>Capture → transcribe → build</span>
      </div>
    </div>
  );
}
