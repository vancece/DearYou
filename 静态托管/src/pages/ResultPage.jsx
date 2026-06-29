import { useEffect } from 'react';
import * as MUSIC from '../music.js';
import LetterView from '../components/LetterView.jsx';
import InkButton from '../components/InkButton.jsx';

export default function ResultPage({ data, style, onSend, onBack }) {
  useEffect(() => {
    return () => MUSIC.stop();
  }, []);

  return (
    <div className="stage">
      <LetterView
        letter={data?.letter || ''}
        relation={data?.relation}
        typing={true}
      >
        <InkButton className="result-send-btn" onClick={onSend}>发送给 Ta</InkButton>
      </LetterView>
    </div>
  );
}
