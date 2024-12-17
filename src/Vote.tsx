import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Vote.css'

export interface Candidate {
  id: string | number;
  name: string;
  imageUrl: string;
}

interface VoteProps {
  candidates: Candidate[];
}

const Vote: React.FC<VoteProps> = ({ candidates }) => {
  const navigate = useNavigate();

  const handleDetailsClick = (candidateId: string | number) => {
    navigate(`/candidate/${candidateId}`);
  };

  return (
    <div className="candidates-container">
      <h2>Кандидаты для голосования</h2>
      <div className="candidates-grid">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <img 
              src={candidate.imageUrl} 
              alt={candidate.name} 
              className="candidate-image"
            />
            <h3 className="candidate-name">
              {candidate.name.split('\n').map((text, i) => (
                <React.Fragment key={i}>
                  {text}
                  {i === 0 && <br />}
                </React.Fragment>
              ))}
            </h3>
            <div className="vote-prompt">
              Чтобы голосовать, нажмите сюда
            </div>
            <button 
              className="details-button"
              onClick={() => handleDetailsClick(candidate.id)}
            >
              Подробнее
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vote;
