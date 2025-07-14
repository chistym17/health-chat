import { useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types/rtvi';

export const useAppointmentFormTrigger = (
  messages: ChatMessage[], 
  onOpenForm: () => void,
  onUpdateField?: (field: string, value: string) => void,
  onSubmitForm?: () => void
) => {
  const lastProcessedMessageId = useRef<string>('');
  const formOpened = useRef<boolean>(false);
  
  // Store callbacks in refs to avoid dependency issues
  const onOpenFormRef = useRef(onOpenForm);
  const onUpdateFieldRef = useRef(onUpdateField);
  const onSubmitFormRef = useRef(onSubmitForm);
  
  // Update refs when callbacks change
  onOpenFormRef.current = onOpenForm;
  onUpdateFieldRef.current = onUpdateField;
  onSubmitFormRef.current = onSubmitForm;

  useEffect(() => {
    const newMessages = messages.filter(msg => msg.id !== lastProcessedMessageId.current);
    
    for (const message of newMessages) {
      if (message.type === 'bot') {
        const text = message.text.toLowerCase().trim();
        
        // Check for completion phrase first
        if (text.includes('information gathering complete. ready for diagnosis.')) {
          alert('Information gathering complete. Ready for diagnosis!');
          // TODO: Trigger redirect to diagnosis page
          continue;
        }
        
        // Check if bot is asking about appointment scheduling
        if (text.includes('appointment') || text.includes('schedule') || text.includes('book')) {
          formOpened.current = true;
          onOpenFormRef.current();
        }
      }
      
      // Parse user messages for appointment field updates and submission
      if (message.type === 'user' && !message.isInterim && formOpened.current) {
        const text = message.text.toLowerCase().trim();
        
        // Check for submission commands first
        const submitPatterns = [
          /submit appointment/i,
          /schedule appointment/i,
          /book appointment/i,
          /confirm appointment/i,
          /done/i,
          /finish/i,
          /complete/i,
          /that's it/i,
          /that is it/i,
          /i'm done/i,
          /i am done/i
        ];
        
        let isSubmission = false;
        for (const pattern of submitPatterns) {
          if (pattern.test(text)) {
            isSubmission = true;
            if (onSubmitFormRef.current) {
              onSubmitFormRef.current();
            }
            break;
          }
        }
        
        // If it's not a submission, process field updates
        if (!isSubmission && onUpdateFieldRef.current) {
          // Parse patient name patterns
          const namePatterns = [
            /my name is (.+)/i,
            /name is (.+)/i,
            /i'm (.+)/i,
            /i am (.+)/i,
            /call me (.+)/i
          ];
          
          for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              const name = match[1].trim();
              if (name.length > 1 && name.length < 50) {
                onUpdateFieldRef.current('patient_name', name);
                break;
              }
            }
          }
          
          // Parse email patterns
          const emailPatterns = [
            /my email is (.+)/i,
            /email is (.+)/i,
            /email address is (.+)/i,
            /my email address is (.+)/i
          ];
          
          for (const pattern of emailPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              const email = match[1].trim();
              // Simple email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(email)) {
                onUpdateFieldRef.current('email', email);
                break;
              }
            }
          }
          
          // Parse appointment reason/symptoms patterns
          const reasonPatterns = [
            /i have (.+)/i,
            /i'm experiencing (.+)/i,
            /i feel (.+)/i,
            /symptoms (.+)/i,
            /pain (.+)/i,
            /problem (.+)/i,
            /i need to see a doctor for (.+)/i,
            /i need help with (.+)/i
          ];
          
          for (const pattern of reasonPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              const reason = match[1].trim();
              if (reason.length > 3) {
                onUpdateFieldRef.current('appointment_reason', reason);
                break;
              }
            }
          }
          
          // Parse urgency patterns
          const urgencyPatterns = [
            /it's urgent/i,
            /this is urgent/i,
            /emergency/i,
            /immediate/i,
            /asap/i
          ];
          
          for (const pattern of urgencyPatterns) {
            if (pattern.test(text)) {
              let urgency = 'high';
              if (text.includes('emergency')) {
                urgency = 'emergency';
              }
              onUpdateFieldRef.current('urgency_level', urgency);
              break;
            }
          }
        }
      }
      
      lastProcessedMessageId.current = message.id;
    }
  }, [messages]); // Only depend on messages, not the callbacks
};

// Keep useContactFormTrigger for backward compatibility
export const useContactFormTrigger = useAppointmentFormTrigger; 