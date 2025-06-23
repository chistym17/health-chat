const AnimationStyles = () => {
  return (
    <style>{`
      @keyframes fade-in { 
        from { 
          opacity: 0; 
          transform: translateY(20px);
        } 
        to { 
          opacity: 1; 
          transform: none; 
        } 
      }
      .animate-fade-in { 
        animation: fade-in 0.7s cubic-bezier(.4,0,.2,1); 
      }
      @keyframes pop { 
        0% { 
          transform: scale(0.7);
        } 
        80% { 
          transform: scale(1.1);
        } 
        100% { 
          transform: scale(1);
        } 
      }
      .animate-pop { 
        animation: pop 0.4s cubic-bezier(.4,0,.2,1); 
      }
      .custom-scrollbar::-webkit-scrollbar { 
        width: 8px; 
      }
      .custom-scrollbar::-webkit-scrollbar-thumb { 
        background: #c7d2fe; 
        border-radius: 8px; 
      }
    `}</style>
  );
};

export default AnimationStyles; 