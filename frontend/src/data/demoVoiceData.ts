export interface DemoVoice {
  id: string;
  speaker: string;
  transcript: string;
  audio: string;
}

export const demoVoices: DemoVoice[] = [
  {
    id: 'joe-fever',
    speaker: 'Joe',
    transcript: `Hi, I'm Joe. I haven't been feeling well lately. I've had a fever for a few days and feel really tired. I hope it's nothing serious. What should I do?`,
    audio: '/audio/demo/joe-fever.mp3',
  },
  {
    id: 'maria-chest',
    speaker: 'Maria',
    transcript: `Hello, I'm Maria. My chest feels a bit tight and I'm coughing a lot. I also feel a little anxious about it. Otherwise, my day has been okay.`,
    audio: '/audio/demo/maria-chest.mp3',
  },
  {
    id: 'sam-dizzy',
    speaker: 'Sam',
    transcript: `Hey, I'm Sam. I've been dizzy and nauseous since this morning. I tried drinking some water and resting, but it hasn't helped much. I'm not sure if I should be worried.`,
    audio: '/audio/demo/sam-dizzy.mp3',
  },
  {
    id: 'priya-joints',
    speaker: 'Priya',
    transcript: `Hi, I'm Priya. My joints are swollen and painful, especially in the morning. I've also been feeling a bit down lately. I hope you can help.`,
    audio: '/audio/demo/priya-joints.mp3',
  },
  {
    id: 'alex-throat',
    speaker: 'Alex',
    transcript: `Hello, I'm Alex. I have a sore throat and a headache. I've also been sneezing a lot. Other than that, I'm just trying to get through my workday.`,
    audio: '/audio/demo/alex-throat.mp3',
  },
]; 