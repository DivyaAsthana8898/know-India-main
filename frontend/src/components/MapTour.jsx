import React, { useState } from 'react';
import Joyride from 'react-joyride';

const MapTour = () => {
  const [runTour, setRunTour] = useState(() => {
    const hasSeenTour = localStorage.getItem('hasSeenMapTour');
    return !hasSeenTour;
  });

  const steps = [
    {
      target: '.gradient-background',
      content: 'Welcome to Know India! Get ready to explore the diverse states and union territories of our beautiful nation.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.mandala-container',
      content: 'Our logo represents the rich cultural heritage of India through the traditional mandala design.',
      placement: 'bottom',
    },
    {
      target: '.colorful-india-map',
      content: 'This interactive map lets you explore all states and union territories. Each region is color-coded for easy identification.',
      placement: 'left',
    },
    {
      target: '.state-info',
      content: 'Here you can find key facts about India\'s diversity, including information about states, languages, and cultural heritage.',
      placement: 'right',
    },
    {
      target: '.quote-container',
      content: 'Discover inspiring quotes about India that showcase its rich heritage. The quotes change automatically every few seconds.',
      placement: 'left',
    },
    {
      target: '.map-container',
      content: 'Click on any state or union territory to explore its unique culture, traditions, and attractions. Hover over a state to see its name.',
      placement: 'left',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped'];
    
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenMapTour', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#4f46e5',
          zIndex: 1000,
          arrowColor: '#4f46e5',
        },
        tooltip: {
          fontSize: '16px',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          padding: '20px',
          borderRadius: '8px',
        },
        buttonNext: {
          backgroundColor: '#4f46e5',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
        buttonBack: {
          marginRight: 10,
          color: '#4f46e5',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px',
        }
      }}
      locale={{
        last: "Finish Tour",
        skip: "Skip Tour",
        next: "Next",
        back: "Back"
      }}
    />
  );
};

export default MapTour; 